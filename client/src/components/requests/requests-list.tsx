"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, X, MapPin, Clock, Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { api, apiRequest } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface MatchRequest {
  id: number
  sender_id: number
  name: string
  age: number
  location: string
  image: string
  bio: string
  timestamp: string
  compatibility: number
  mutualFriends: number
  interests: string[]
}

export function RequestsList() {
  const [requests, setRequests] = useState<MatchRequest[]>([])
  const [processedRequests, setProcessedRequests] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Fetch match requests - wait for auth to finish loading
  useEffect(() => {
    // Only fetch when authenticated and auth is not loading
    if (isAuthenticated && !authLoading) {
      fetchRequests()
    } else if (!isAuthenticated && !authLoading) {
      // If not authenticated after auth loading completes, set empty state
      setIsLoading(false)
      setRequests([])
    }
  }, [isAuthenticated, authLoading])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch incoming match requests from backend
      const response = await apiRequest('/api/match/incoming-requests')
      console.log('Fetch requests response:', response)
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.requests) {
        setRequests(response.data.requests)
        console.log('Loaded requests:', response.data.requests)
      } else {
        setRequests([])
      }
      
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to load requests')
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (request: MatchRequest) => {
    if (processingId) return
    
    setProcessingId(request.sender_id)
    
    try {
      const response = await api.respondMatchRequest(request.sender_id, true)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Success - remove from list
      setProcessedRequests((prev) => [...prev, request.sender_id])
      
      // Show success message (you can add a toast notification here)
      console.log(`Accepted match request from ${request.name}`)
      
      // Optionally refresh the list
      setTimeout(() => {
        fetchRequests()
      }, 1000)
    } catch (err) {
      console.error('Error accepting request:', err)
      alert(err instanceof Error ? err.message : 'Failed to accept request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (request: MatchRequest) => {
    if (processingId) return
    
    setProcessingId(request.sender_id)
    
    try {
      const response = await api.respondMatchRequest(request.sender_id, false)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Success - remove from list
      setProcessedRequests((prev) => [...prev, request.sender_id])
      
      console.log(`Rejected match request from ${request.name}`)
      
      // Optionally refresh the list
      setTimeout(() => {
        fetchRequests()
      }, 1000)
    } catch (err) {
      console.error('Error rejecting request:', err)
      alert(err instanceof Error ? err.message : 'Failed to reject request')
    } finally {
      setProcessingId(null)
    }
  }

  const activeRequests = requests.filter((request) => !processedRequests.includes(request.sender_id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Incoming Requests</h3>
        <span className="text-sm text-white/60">{activeRequests.length} pending</span>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#FF0059] animate-spin mb-4" />
          <p className="text-white/60">Loading requests...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠</span>
          </div>
          <p className="text-red-400 mb-4">Failed to load requests</p>
          <p className="text-white/70 text-sm mb-6">{error}</p>
          <Button
            onClick={fetchRequests}
            className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-6 py-3 rounded-xl"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <img
                    src={request.image || "/default.jpg"}
                    alt={request.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20"
                  />
                </div>

                {/* Request Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-1">
                        {request.name}, {request.age}
                      </h4>
                      <div className="flex items-center justify-center sm:justify-start gap-1 mb-2">
                        <MapPin className="h-4 w-4 text-white/50" />
                        <span className="text-sm text-white/60">{request.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-[#FF0059]" />
                        <span className="text-sm text-[#FF0059] font-medium">{request.compatibility}% match</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm leading-relaxed mb-4">{request.bio}</p>

                  {/* Interests */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                    {request.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#FF0059]/20 border border-[#FF0059]/30 text-[#FF0059] text-xs font-medium rounded-lg"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-6 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{request.timestamp}</span>
                    </div>
                    {request.mutualFriends > 0 && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{request.mutualFriends} mutual connections</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                    <Button
                      onClick={() => handleAccept(request)}
                      disabled={processingId === request.sender_id}
                      className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-6 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request.sender_id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      disabled={processingId === request.sender_id}
                      variant="outline"
                      className="border-white/20 hover:border-red-500/50 bg-white/5 hover:bg-red-500/10 px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request.sender_id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Decline
                    </Button>
                    <Button
                      onClick={() => router.push(`/user/${request.sender_id}`)}
                      variant="outline"
                      className="border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 px-6 py-2 rounded-xl"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && !error && activeRequests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-[#FF0059]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-[#FF0059]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No pending requests</h3>
          <p className="text-white/60">New match requests will appear here</p>
        </motion.div>
      )}
    </motion.div>
  )
}
