"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UserCard } from "@/components/dashboard/user-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useState, useEffect } from "react"
import { Heart, X, Sparkles, TrendingUp, Users, MessageCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRecommendations, type Candidate } from "@/hooks/use-recommendations"
import { RecommendationFiltersComponent } from "@/components/dashboard/recommendation-filters"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useDashboardStats } from "@/hooks/use-stats"
import { useUserData } from "@/hooks/use-user-data"



// Daily Tips Collection
const DAILY_TIPS = [
  {
    text: "Profiles with detailed bios get 3x more matches. Make sure to showcase your personality and interests!",
    buttonLabel: "Update My Profile",
  },
  {
    text: "Adding 4-6 photos increases your chances of getting a match by 72%. Show different sides of your personality!",
    buttonLabel: "Add More Photos",
  },
  {
    text: "Users who respond within 24 hours are 25% more likely to get a date. Don't leave your matches waiting!",
    buttonLabel: "Check Messages",
  },
  {
    text: "Profiles mentioning hobbies get 40% more engagement. What makes you unique?",
    buttonLabel: "Edit Interests",
  },
  {
    text: "Be authentic! Profiles with genuine photos get 2x more likes than heavily filtered ones.",
    buttonLabel: "Review Photos",
  },
]

// Using the first tip as the current daily tip
const DAILY_TIP = DAILY_TIPS[0]

// Profile Statistics (Initial Values) - removed as we'll use real data
// const INITIAL_STATS = {
//   matches: 12,
//   views: 47,
// }

// Quick Action Items
const QUICK_ACTIONS = [
  { icon: Users, label: "Browse by Location", action: "location" },
  { icon: Sparkles, label: "Boost My Profile", action: "boost" },
  { icon: Heart, label: "Who Liked Me", action: "likes" },
  { icon: MessageCircle, label: "Unread Messages", action: "messages" },
  { icon: TrendingUp, label: "Profile Insights", action: "insights" },
]

// No More Users Messages
const NO_USERS_MESSAGE = {
  title: "You're all caught up!",
  description: "No more profiles to show right now. Check back later for new matches or expand your search criteria.",
  primaryButton: "Start Over",
  secondaryButton: "Adjust Filters",
}

// Progress Indicator Messages
const PROGRESS_MESSAGES = [
  "Keep swiping!",
  "You're on fire!",
  "Almost there!",
  "profiles remaining",
]



interface RecentMatch {
  match_id: number
  user_id: number
  name: string
  image: string
  matched_at: string
  last_message?: string
  last_message_at?: string
}

export default function DashboardPage() {
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [likedUsers, setLikedUsers] = useState<number[]>([])
  const [rejectedUsers, setRejectedUsers] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  // Fetch dashboard statistics from context
  const { dashboardStats } = useUserData()
  
  // Fetch matches from context
  const { matches: recentMatches, isLoading: loadingMatches } = useUserData()

  // Use recommendations context
  const {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    removeRecommendation,
    refreshRecommendations,
    rejectUser,
    updateFilters,
  } = useRecommendations()

  const currentUser = recommendations[currentUserIndex]
  const remainingUsers = recommendations.length - currentUserIndex

  // Reset index when recommendations change completely (e.g., new filters applied)
  useEffect(() => {
    const prevLength = recommendations.length
    if (currentUserIndex >= recommendations.length && recommendations.length > 0) {
      setCurrentUserIndex(0)
    }
  }, [recommendations.length, currentUserIndex])

  // Auto-refresh recommendations when they run low (with debounce)
  useEffect(() => {
    // Only fetch more if we have less than 3 profiles remaining and there might be more
    if (recommendations.length > 0 && 
        recommendations.length - currentUserIndex <= 2 && 
        recommendations.length - currentUserIndex > 0 &&
        !isLoading) {
      const timer = setTimeout(() => {
        fetchRecommendations(undefined, true) // Append more recommendations
      }, 500) // Debounce to prevent multiple calls
      
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserIndex, recommendations.length, isLoading])

  // Convert Candidate -> UserCard format
  const convertToUserCardFormat = (candidate: Candidate) => {
    const user = candidate.user
    return {
      id: String(user.id),
      name: user.name,
      age: user.age,
      location: user.city,
      bio: `Lives in ${user.city}. Looking for meaningful connections and great conversations.`,
      interests: ["Travel", "Music", "Coffee", "Movies", "Reading"],
      profileImage: (user.images && user.images[0]) || "/default.jpg",
      images: user.images && user.images.length ? user.images : ["/default.jpg"],
      compatibility: candidate.match_score || Math.round(candidate.score * 100),
      isOnline: Math.random() > 0.5,
      lastSeen: "2 hours ago",
      occupation: "Professional",
    }
  }

  const handleLike = async () => {
    if (isAnimating || !currentUser) return

    setIsAnimating(true)
  setLikedUsers((prev) => [...prev, currentUser.user.id])

    try {
      // Send match request to backend API
  const response = await api.sendMatchRequest(currentUser.user.id)
      if (response.error) {
        console.error('Failed to send match request:', response.error)
        // You might want to show a toast notification here
      } else {
        console.log('Match request sent successfully')
      }
    } catch (error) {
      console.error('Error sending match request:', error)
    }

  // Remove from recommendations (don't increment index since removal shifts array)
  removeRecommendation(currentUser.user.id)

    setTimeout(() => {
      // No need to increment index - the array shifts when item is removed
      setIsAnimating(false)
    }, 300)
  }

  const handleReject = async () => {
    if (isAnimating || !currentUser) return

    setIsAnimating(true)
    setRejectedUsers((prev) => [...prev, currentUser.user.id])

    // Notify backend and remove locally (don't increment index since removal shifts array)
    await rejectUser(currentUser.user.id)

    setTimeout(() => {
      // No need to increment index - the array shifts when item is removed
      setIsAnimating(false)
    }, 300)
  }



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <DashboardNav />

        {/* Main Content with proper spacing from navbar */}
        <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Flex-based responsive layout */}
            <div className="flex flex-wrap gap-6 lg:gap-8">
              {/* Left Sidebar - Stats & Activity */}
              <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6 order-2 lg:order-1">
                <QuickStats 
                  likes={dashboardStats?.activity_stats?.likes || 0} 
                  matches={dashboardStats?.activity_stats?.matches || 0} 
                  views={dashboardStats?.activity_stats?.profile_views || 0} 
                />
                <ActivityFeed />
            </div>

            {/* Center - Main Card Area */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-start order-1 lg:order-2">
              <div className="w-full max-w-md mx-auto">
                {/* Loading State */}
                {isLoading && recommendations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0059] mx-auto mb-4"></div>
                    <p className="text-white/70">Finding perfect matches for you...</p>
                  </motion.div>
                ) : error ? (
                  /* Error State */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-red-400 text-2xl">⚠</span>
                    </div>
                    <p className="text-red-400 mb-4">Failed to load recommendations</p>
                    <p className="text-white/70 text-sm mb-6">{error}</p>
                    <Button
                      onClick={refreshRecommendations}
                      className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-6 py-3 rounded-xl"
                    >
                      Try Again
                    </Button>
                  </motion.div>
                ) : currentUser ? (
                  <div className="relative">
                    {/* Background cards for depth */}
                    {recommendations.slice(currentUserIndex + 1, currentUserIndex + 3).map((c: Candidate, index: number) => (
                      <div
                        key={c.user.id}
                        className="absolute inset-0 bg-white/5 rounded-3xl border border-white/10"
                        style={{
                          transform: `scale(${0.95 - index * 0.05}) translateY(${(index + 1) * 8}px)`,
                          zIndex: -index - 1,
                          opacity: 0.5 - index * 0.2,
                        }}
                      />
                    ))}

                    {/* Current user card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentUser.user.id}
                        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          x: isAnimating ? (likedUsers.includes(currentUser.user.id) ? 300 : -300) : 0,
                          rotateZ: isAnimating ? (likedUsers.includes(currentUser.user.id) ? 15 : -15) : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative z-10"
                      >
                        <UserCard
                          user={convertToUserCardFormat(currentUser)}
                          onLike={handleLike}
                          onReject={handleReject}
                          onSuperLike={() => {}} // Dummy function since we're removing super like
                          isAnimating={isAnimating}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex justify-center items-center space-x-6 sm:space-x-8 mt-6 sm:mt-8"
                    >
                      <Button
                        onClick={handleReject}
                        disabled={isAnimating}
                        className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-red-500/50 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <X className="h-6 w-6 sm:h-8 sm:w-8 text-white/70 group-hover:text-red-500 transition-colors" />
                      </Button>

                      <Button
                        onClick={handleLike}
                        disabled={isAnimating}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#FF0059] to-[#FF0059]/80 hover:from-[#FF0059]/90 hover:to-[#FF0059]/70 border-2 border-[#FF0059] transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-[#FF0059]/25"
                      >
                        <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:scale-110 transition-transform" />
                      </Button>
                    </motion.div>

                    {/* Progress indicator */}
                    <div className="text-center mt-4 sm:mt-6">
                      <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 sm:px-4 py-2">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-[#FF0059]" />
                        <span className="text-xs sm:text-sm font-medium text-white/80">
                          {remainingUsers} profiles remaining
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // No more users
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-12 sm:py-20"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FF0059]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-[#FF0059]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">{NO_USERS_MESSAGE.title}</h2>
                    <p className="text-white/60 text-base sm:text-lg mb-8 max-w-md mx-auto px-4">
                      {NO_USERS_MESSAGE.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                      <Button
                        onClick={async () => {
                          setCurrentUserIndex(0)
                          setLikedUsers([])
                          setRejectedUsers([])
                          await refreshRecommendations()
                        }}
                        className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-6 sm:px-8 py-3 rounded-xl font-semibold"
                      >
                        {NO_USERS_MESSAGE.primaryButton}
                      </Button>
                      <Button
                        onClick={() => setShowFilters(true)}
                        variant="outline"
                        className="border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 px-6 sm:px-8 py-3 rounded-xl"
                      >
                        {NO_USERS_MESSAGE.secondaryButton}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Recent Matches & Tips */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6 order-3">
              {/* Recent Matches */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Recent Matches</h3>
                  <div className="w-2 h-2 bg-[#FF0059] rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-3">
                  {loadingMatches ? (
                    <div className="py-6 text-center text-white/60">Loading matches...</div>
                  ) : recentMatches.length === 0 ? (
                    <div className="py-6 text-center text-white/60">No recent matches yet</div>
                  ) : (
                    recentMatches.map((match, index) => (
                      <div
                        key={match.match_id}
                        onClick={() => router.push(`/user/${match.user_id}`)}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Image
                          width={40}
                          height={40}
                          src={match.image || "/default.jpg"}
                          alt={match.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">{match.name}</div>
                          <div className="text-white/60 text-xs">{match.last_message_at || match.matched_at || 'Recently'}</div>
                        </div>
                        <MessageCircle className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                      </div>
                    ))
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 text-sm"
                >
                  View All Matches
                </Button>
              </motion.div>

              {/* Daily Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-[#FF0059]/10 to-[#FF0059]/5 backdrop-blur-sm border border-[#FF0059]/20 rounded-2xl p-4 sm:p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF0059] flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-white">Daily Tip</h3>
                </div>

                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {DAILY_TIP.text}
                </p>

                <Button className="w-full bg-[#FF0059]/20 hover:bg-[#FF0059]/30 border border-[#FF0059]/30 text-[#FF0059] text-sm font-medium">
                  {DAILY_TIP.buttonLabel}
                </Button>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h3>

                <div className="space-y-3">
                  {QUICK_ACTIONS.slice(0, 2).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 text-sm"
                    >
                      <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{action.label}</span>
                    </Button>
                  ))}
                  
                  {/* Filter Button */}
                  <Button
                    onClick={() => setShowFilters(true)}
                    variant="outline"
                    className="w-full justify-start border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 text-sm"
                  >
                    <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Filter Preferences</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
        </div>
      </main>
   
      {/* Recommendation Filters Modal */}
      <RecommendationFiltersComponent 
        isOpen={showFilters} 
        onClose={() => setShowFilters(false)}
        onFiltersApplied={() => {
          setCurrentUserIndex(0) // Reset to first card when filters change
        }}
      />
    </div>
    </ProtectedRoute>
  )
}
