/**
 * API utility functions for making authenticated requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * Get the auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Get the user ID from localStorage
 */
export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('user_id')
}

/**
 * Make an authenticated API request with retry logic
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<{ data?: T; error?: string }> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge existing headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value
      }
    })
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      const hasJsonContent = contentType && contentType.includes('application/json')

      if (!response.ok) {
        let errorText = `Request failed with status ${response.status}`
        
        // Try to get error message from response
        if (hasJsonContent) {
          try {
            const errorData = await response.json()
            errorText = errorData.error || errorData.message || errorText
          } catch {
            errorText = await response.text() || errorText
          }
        } else {
          errorText = await response.text() || errorText
        }
        
        // Don't retry on auth errors (401, 403)
        if (response.status === 401 || response.status === 403) {
          return { error: errorText }
        }
        
        // Retry on server errors (500+) and rate limits (429)
        if (attempt < retries && (response.status >= 500 || response.status === 429)) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000) // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        return { error: errorText }
      }

      // Handle empty successful responses
      if (!hasJsonContent || response.status === 204) {
        return { data: {} as T }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error(`API request error (attempt ${attempt + 1}/${retries + 1}):`, error)
      
      // Retry on network errors
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return { error: 'Network error. Please check your connection and try again.' }
    }
  }

  return { error: 'Request failed after multiple attempts.' }
}

/**
 * Specific API methods
 */
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: { name: string; email: string; password: string; gender: string; age: number; city: string }) =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkEmail: async (email: string): Promise<{ exists: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        return { exists: false, error: 'Unable to verify email' }
      }

      const data = await response.json()
      return { exists: data.exists || false }
    } catch (error) {
      console.error('Email check error:', error)
      return { exists: false, error: 'Network error' }
    }
  },

  // User Profile
  getProfile: (userId: number) =>
    apiRequest(`/api/user/profile/${userId}`),

  getUserImages: (userId: number) =>
    apiRequest(`/api/user/images/${userId}`),

  // Chatbot Score
  submitScore: (scores: { personality: number; communication: number; emotional: number; confidence: number }) =>
    apiRequest('/api/chatbot/submit-score', {
      method: 'POST',
      body: JSON.stringify(scores),
    }),

  // Matching
  getRecommendations: (params: { gender?: string; age_min?: number; age_max?: number; limit?: number; min_score?: number }) => {
    const queryParams = new URLSearchParams()
    if (params.gender) queryParams.set('gender', params.gender)
    if (params.age_min) queryParams.set('age_min', params.age_min.toString())
    if (params.age_max) queryParams.set('age_max', params.age_max.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.min_score !== undefined) queryParams.set('min_score', params.min_score.toString())
    
    return apiRequest(`/api/match/recommendations?${queryParams.toString()}`)
  },

  sendMatchRequest: (receiverId: number) =>
    apiRequest('/api/match/request', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId }),
    }),

  rejectUser: (receiverId: number) =>
    apiRequest('/api/match/reject', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId }),
    }),

  respondMatchRequest: (senderId: number, accept: boolean) =>
    apiRequest('/api/match/respond', {
      method: 'POST',
      body: JSON.stringify({ sender_id: senderId, accept }),
    }),

  getIncomingRequests: () =>
    apiRequest('/api/match/incoming-requests'),

  getRecentMatches: () =>
    apiRequest('/api/match/recent'),

  // Chat
  sendMessage: (matchId: number, message: string) =>
    apiRequest('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({ match_id: matchId, message }),
    }),

  getMessages: (matchId: number) =>
    apiRequest(`/api/chat/${matchId}`),

  // Image uploads
  uploadImages: (formData: FormData) =>
    fetch(`${API_BASE_URL}/api/user/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.text()
        return { error }
      }
      return { data: await res.json() }
    }),

  listUserImages: () =>
    apiRequest('/api/user/images'),

  setPrimaryImage: (imageId: number) =>
    apiRequest(`/api/user/image/${imageId}/primary`, {
      method: 'POST',
    }),

  deleteUserImage: (imageId: number) =>
    apiRequest(`/api/user/image/${imageId}/delete`, {
      method: 'DELETE',
    }),

  // Statistics
  getUserStats: () =>
    apiRequest('/api/stats/activity'),

  getWeeklyActivity: () =>
    apiRequest('/api/stats/weekly'),

  getRequestStats: () =>
    apiRequest('/api/stats/requests'),

  getProfileAnalytics: () =>
    apiRequest('/api/stats/analytics'),

  getDashboardStats: () =>
    apiRequest('/api/stats/dashboard'),
}

export default api
