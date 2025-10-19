"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, MoreHorizontal, MapPin, Clock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface Match {
  match_id: number
  user_id: number
  name: string
  age: number
  location: string
  image: string
  bio: string
  matched_at: string
  compatibility: number
  last_message?: string
  last_message_at?: string
  unread_count: number
}

export function MatchesList() {
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  // Import useAuth to check authentication state
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    // Only fetch when authenticated and auth is not loading
    if (isAuthenticated && !authLoading) {
      fetchRecentMatches()
    } else if (!isAuthenticated && !authLoading) {
      // If not authenticated after auth loading completes, set empty state
      setLoading(false)
      setMatches([])
    }
  }, [isAuthenticated, authLoading])

  const fetchRecentMatches = async () => {
    setLoading(true)
    setError(null)
    
    const { data, error: apiError } = await api.getRecentMatches()
    
    if (apiError) {
      setError(apiError)
      setLoading(false)
      return
    }
    
    if (data?.matches) {
      setMatches(data.matches)
    }
    setLoading(false)
  }

  const handleChatClick = (matchId: number) => {
    // Navigate to chat or open chat modal
    router.push(`/chat?match_id=${matchId}`)
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF0059] mx-auto mb-4" />
          <p className="text-white/60">Loading your matches...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
      >
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchRecentMatches} className="bg-[#FF0059] hover:bg-[#FF0059]/90">
            Try Again
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Matches</h3>
        <span className="text-sm text-white/60">{matches.length} matches</span>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">No matches yet</h4>
          <p className="text-white/60 mb-6">Start swiping to find your perfect match!</p>
          <Button onClick={() => router.push('/dashboard')} className="bg-[#FF0059] hover:bg-[#FF0059]/90">
            Browse Profiles
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.match_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedMatch === match.match_id ? "border-[#FF0059]/50 bg-[#FF0059]/5" : ""
              }`}
              onClick={() => setSelectedMatch(match.match_id)}
            >
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="relative">
                  <img
                    src={match.image || "/default.jpg"}
                    alt={match.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                  />
                  {match.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0059] rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{match.unread_count}</span>
                    </div>
                  )}
                </div>

                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white truncate">
                      {match.name}, {match.age}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-[#FF0059]" />
                      <span className="text-xs text-[#FF0059] font-medium">{match.compatibility}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/60 truncate">{match.location}</span>
                  </div>

                  {match.last_message && (
                    <p className="text-sm text-white/70 truncate mb-2">{match.last_message}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-white/50" />
                      <span className="text-xs text-white/50">{match.matched_at || match.last_message_at || 'Recently'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-[#FF0059] hover:bg-[#FF0059]/90 h-8 px-3 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleChatClick(match.match_id)
                        }}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/user/${match.user_id}`)
                        }}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
