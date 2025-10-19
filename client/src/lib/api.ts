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
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { error: errorText || `Request failed with status ${response.status}` }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    console.error('API request error:', error)
    return { error: 'Network error. Please check if the backend is running.' }
  }
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
  getRecommendations: (params: { gender?: string; age_min?: number; age_max?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (params.gender) queryParams.set('gender', params.gender)
    if (params.age_min) queryParams.set('age_min', params.age_min.toString())
    if (params.age_max) queryParams.set('age_max', params.age_max.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())
    
    return apiRequest(`/api/match/recommendations?${queryParams.toString()}`)
  },

  sendMatchRequest: (receiverId: number) =>
    apiRequest('/api/match/request', {
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
}

export default api
