"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, X, Zap, MessageCircle, Gift, Star } from "lucide-react"
import { useState } from "react"

interface User {
  id: string
  name: string
}

interface UserProfileActionsProps {
  user: User
}

export function UserProfileActions({ user }: UserProfileActionsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [isSuperLiked, setIsSuperLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(true)
    // Handle like logic
  }

  const handleReject = () => {
    setIsRejected(true)
    // Handle reject logic
  }

  const handleSuperLike = () => {
    setIsSuperLiked(true)
    // Handle super like logic
  }

  const handleMessage = () => {
    // Navigate to chat or open message modal
  }

  const handleGift = () => {
    // Open gift sending modal
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Actions</h3>

      {/* Main Action Buttons */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <Button
          onClick={handleReject}
          disabled={isRejected}
          className={`w-14 h-14 rounded-full transition-all duration-300 hover:scale-110 ${
            isRejected
              ? "bg-red-500/50 cursor-not-allowed"
              : "bg-white/10 hover:bg-red-500/20 border-2 border-white/20 hover:border-red-500/50"
          }`}
        >
          <X
            className={`h-6 w-6 ${isRejected ? "text-red-300" : "text-white/70 hover:text-red-500"} transition-colors`}
          />
        </Button>

        <Button
          onClick={handleSuperLike}
          disabled={isSuperLiked}
          className={`w-16 h-16 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${
            isSuperLiked
              ? "bg-blue-500/50 cursor-not-allowed shadow-blue-500/25"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/25"
          }`}
        >
          <Zap className={`h-7 w-7 ${isSuperLiked ? "text-blue-300" : "text-white"} transition-colors`} />
        </Button>

        <Button
          onClick={handleLike}
          disabled={isLiked}
          className={`w-14 h-14 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${
            isLiked
              ? "bg-[#FF0059]/50 cursor-not-allowed shadow-[#FF0059]/25"
              : "bg-gradient-to-r from-[#FF0059] to-[#FF0059]/80 hover:from-[#FF0059]/90 hover:to-[#FF0059]/70 shadow-[#FF0059]/25"
          }`}
        >
          <Heart className={`h-6 w-6 ${isLiked ? "text-pink-300" : "text-white"} transition-colors`} />
        </Button>
      </div>

      {/* Status Messages */}
      {(isLiked || isRejected || isSuperLiked) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          {isLiked && (
            <div className="bg-[#FF0059]/20 border border-[#FF0059]/40 rounded-xl p-3">
              <p className="text-[#FF0059] font-medium text-sm">❤️ You liked {user.name}!</p>
            </div>
          )}
          {isRejected && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3">
              <p className="text-red-400 font-medium text-sm">You passed on {user.name}</p>
            </div>
          )}
          {isSuperLiked && (
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl p-3">
              <p className="text-blue-400 font-medium text-sm">⚡ You super liked {user.name}!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Additional Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleMessage}
          className="w-full bg-[#FF0059]/20 hover:bg-[#FF0059]/30 border border-[#FF0059]/40 hover:border-[#FF0059]/60 text-[#FF0059] font-semibold py-3 rounded-xl transition-all duration-300"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Send Message
        </Button>

        <Button
          onClick={handleGift}
          variant="outline"
          className="w-full border-white/20 hover:border-purple-500/50 bg-white/5 hover:bg-purple-500/10 text-white hover:text-purple-400 py-3 rounded-xl transition-all duration-300"
        >
          <Gift className="h-5 w-5 mr-2" />
          Send Gift
        </Button>

        <Button
          variant="outline"
          className="w-full border-white/20 hover:border-yellow-500/50 bg-white/5 hover:bg-yellow-500/10 text-white hover:text-yellow-400 py-3 rounded-xl transition-all duration-300"
        >
          <Star className="h-5 w-5 mr-2" />
          Add to Favorites
        </Button>
      </div>

      {/* Safety Notice */}
      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-blue-400 text-center">🛡️ Always meet in public places and trust your instincts</p>
      </div>
    </motion.div>
  )
}
