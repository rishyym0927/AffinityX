"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UserCard } from "@/components/dashboard/user-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { useState } from "react"
import { Heart, X, Zap, Sparkles, TrendingUp, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

// Hardcoded user data
const users = [
  {
    id: 1,
    name: "Sarah Chen",
    age: 28,
    location: "San Francisco, CA",
    bio: "Full-stack developer passionate about AI and machine learning. Love hiking and exploring new coffee shops.",
    interests: ["React", "Python", "AI/ML", "Hiking", "Coffee"],
    profileImage: "/placeholder.svg?height=400&width=300",
    images: [
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
    ],
    compatibility: 95,
    isOnline: true,
    lastSeen: "Active now",
    occupation: "Senior Software Engineer at Stripe",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    age: 32,
    location: "Austin, TX",
    bio: "DevOps engineer who loves building scalable systems. Weekend warrior on the basketball court.",
    interests: ["Kubernetes", "AWS", "Basketball", "Gaming", "Music"],
    profileImage: "/placeholder.svg?height=400&width=300",
    images: ["/placeholder.svg?height=400&width=300", "/placeholder.svg?height=400&width=300"],
    compatibility: 88,
    isOnline: false,
    lastSeen: "2 hours ago",
    occupation: "DevOps Lead at Vercel",
  },
  {
    id: 3,
    name: "Emily Watson",
    age: 26,
    location: "Seattle, WA",
    bio: "Frontend developer with a passion for creating beautiful user experiences. Love traveling and photography.",
    interests: ["Vue.js", "Design", "Photography", "Travel", "Art"],
    profileImage: "/placeholder.svg?height=400&width=300",
    images: [
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
    ],
    compatibility: 92,
    isOnline: true,
    lastSeen: "Active now",
    occupation: "Frontend Developer at GitHub",
  },
  {
    id: 4,
    name: "Alex Thompson",
    age: 30,
    location: "New York, NY",
    bio: "Mobile app developer specializing in React Native. Fitness enthusiast and tech blogger.",
    interests: ["React Native", "iOS", "Fitness", "Writing", "Startups"],
    profileImage: "/placeholder.svg?height=400&width=300",
    images: ["/placeholder.svg?height=400&width=300", "/placeholder.svg?height=400&width=300"],
    compatibility: 85,
    isOnline: false,
    lastSeen: "1 day ago",
    occupation: "Mobile Developer at Airbnb",
  },
  {
    id: 5,
    name: "Jordan Kim",
    age: 29,
    location: "Los Angeles, CA",
    bio: "Data scientist turning complex data into actionable insights. Love cooking and exploring LA's food scene.",
    interests: ["Python", "Data Science", "Cooking", "Food", "Analytics"],
    profileImage: "/placeholder.svg?height=400&width=300",
    images: [
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=400&width=300",
    ],
    compatibility: 90,
    isOnline: true,
    lastSeen: "Active now",
    occupation: "Data Scientist at Netflix",
  },
]

export default function DashboardPage() {
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [likedUsers, setLikedUsers] = useState<number[]>([])
  const [rejectedUsers, setRejectedUsers] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const currentUser = users[currentUserIndex]
  const remainingUsers = users.length - currentUserIndex

  const handleLike = () => {
    if (isAnimating || !currentUser) return

    setIsAnimating(true)
    setLikedUsers((prev) => [...prev, currentUser.id])

    setTimeout(() => {
      setCurrentUserIndex((prev) => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  const handleReject = () => {
    if (isAnimating || !currentUser) return

    setIsAnimating(true)
    setRejectedUsers((prev) => [...prev, currentUser.id])

    setTimeout(() => {
      setCurrentUserIndex((prev) => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  const handleSuperLike = () => {
    if (isAnimating || !currentUser) return

    setIsAnimating(true)
    setLikedUsers((prev) => [...prev, currentUser.id])

    setTimeout(() => {
      setCurrentUserIndex((prev) => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav />

      {/* Main Content with proper spacing from navbar */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Flex-based responsive layout */}
          <div className="flex flex-wrap gap-6 lg:gap-8">
            {/* Left Sidebar - Stats & Activity */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6 order-2 lg:order-1">
              <QuickStats likes={likedUsers.length} matches={12} superLikes={3} views={47} />
              <ActivityFeed />
            </div>

            {/* Center - Main Card Area */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-start order-1 lg:order-2">
              <div className="w-full max-w-md mx-auto">
                {currentUserIndex < users.length ? (
                  <div className="relative">
                    {/* Background cards for depth */}
                    {users.slice(currentUserIndex + 1, currentUserIndex + 3).map((user, index) => (
                      <div
                        key={user.id}
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
                        key={currentUser.id}
                        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          x: isAnimating ? (likedUsers.includes(currentUser.id) ? 300 : -300) : 0,
                          rotateZ: isAnimating ? (likedUsers.includes(currentUser.id) ? 15 : -15) : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative z-10"
                      >
                        <UserCard
                          user={currentUser}
                          onLike={handleLike}
                          onReject={handleReject}
                          onSuperLike={handleSuperLike}
                          isAnimating={isAnimating}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex justify-center items-center space-x-4 sm:space-x-6 mt-6 sm:mt-8"
                    >
                      <Button
                        onClick={handleReject}
                        disabled={isAnimating}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-red-500/50 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <X className="h-5 w-5 sm:h-7 sm:w-7 text-white/70 group-hover:text-red-500 transition-colors" />
                      </Button>

                      <Button
                        onClick={handleSuperLike}
                        disabled={isAnimating}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-2 border-blue-400 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-blue-500/25"
                      >
                        <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:scale-110 transition-transform" />
                      </Button>

                      <Button
                        onClick={handleLike}
                        disabled={isAnimating}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#FF0059] to-[#FF0059]/80 hover:from-[#FF0059]/90 hover:to-[#FF0059]/70 border-2 border-[#FF0059] transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-[#FF0059]/25"
                      >
                        <Heart className="h-5 w-5 sm:h-7 sm:w-7 text-white group-hover:scale-110 transition-transform" />
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
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">You're all caught up!</h2>
                    <p className="text-white/60 text-base sm:text-lg mb-8 max-w-md mx-auto px-4">
                      No more profiles to show right now. Check back later for new matches or expand your search
                      criteria.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                      <Button
                        onClick={() => {
                          setCurrentUserIndex(0)
                          setLikedUsers([])
                          setRejectedUsers([])
                        }}
                        className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-6 sm:px-8 py-3 rounded-xl font-semibold"
                      >
                        Start Over
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 px-6 sm:px-8 py-3 rounded-xl"
                      >
                        Adjust Filters
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
                  {[
                    { name: "Alex", image: "/placeholder.svg?height=40&width=40", time: "2m ago" },
                    { name: "Jordan", image: "/placeholder.svg?height=40&width=40", time: "1h ago" },
                    { name: "Casey", image: "/placeholder.svg?height=40&width=40", time: "3h ago" },
                  ].map((match, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <img
                        src={match.image || "/placeholder.svg"}
                        alt={match.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{match.name}</div>
                        <div className="text-white/60 text-xs">{match.time}</div>
                      </div>
                      <MessageCircle className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                    </div>
                  ))}
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
                  Profiles with detailed bios get 3x more matches. Make sure to showcase your personality and interests!
                </p>

                <Button className="w-full bg-[#FF0059]/20 hover:bg-[#FF0059]/30 border border-[#FF0059]/30 text-[#FF0059] text-sm font-medium">
                  Update My Profile
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
                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 text-sm"
                  >
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Browse by Location</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 text-sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Boost My Profile</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
        </div>
      </main>
   
    </div>
  )
}
