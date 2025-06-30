"use client"
import { Heart, X, Zap, MapPin, Briefcase, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface User {
  id: number
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  profileImage: string
  images: string[]
  compatibility: number
  isOnline: boolean
  lastSeen: string
  occupation: string
}

interface UserCardProps {
  user: User
  onLike: () => void
  onReject: () => void
  onSuperLike: () => void
  isAnimating: boolean
}

export function UserCard({ user, onLike, onReject, onSuperLike, isAnimating }: UserCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % user.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + user.images.length) % user.images.length)
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-[#FF0059]/10 relative">
      {/* Image Section */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={user.images[currentImageIndex] || "/placeholder.svg"}
          alt={user.name}
          className="w-full h-full object-cover"
        />

        {/* Image navigation */}
        {user.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              →
            </button>

            {/* Image indicators */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {user.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Online status */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
          {user.isOnline ? (
            <>
              <Wifi className="h-3 w-3 text-green-400" />
              <span className="text-xs text-white font-medium hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-white/50" />
              <span className="text-xs text-white/70 hidden sm:inline">{user.lastSeen}</span>
            </>
          )}
        </div>

        {/* Compatibility badge */}
        <div className="absolute bottom-4 left-4 bg-gradient-to-r from-[#FF0059] to-[#FF0059]/80 rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-lg shadow-[#FF0059]/25">
          <span className="text-white font-bold text-xs sm:text-sm">{user.compatibility}% Match</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate flex-1 mr-2">
              {user.name}, {user.age}
            </h2>
            <Button
              onClick={onSuperLike}
              disabled={isAnimating}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 p-0 transition-all duration-300 hover:scale-110 disabled:opacity-50 flex-shrink-0"
            >
              <Zap className="h-4 w-4 text-white" />
            </Button>
          </div>

          <div className="flex items-center text-white/60 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{user.location}</span>
          </div>

          <div className="flex items-center text-white/60 text-sm">
            <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{user.occupation}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3">{user.bio}</p>

        {/* Interests */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 6).map((interest, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-1 bg-[#FF0059]/20 border border-[#FF0059]/30 text-[#FF0059] text-xs font-medium rounded-full"
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 6 && (
              <span className="px-2 sm:px-3 py-1 bg-white/10 border border-white/20 text-white/60 text-xs font-medium rounded-full">
                +{user.interests.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={onReject}
            disabled={isAnimating}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-red-500/50 transition-all duration-300 hover:scale-110 disabled:opacity-50 group"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 group-hover:text-red-500 transition-colors" />
          </Button>

          <Button
            onClick={onLike}
            disabled={isAnimating}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#FF0059] to-[#FF0059]/80 hover:from-[#FF0059]/90 hover:to-[#FF0059]/70 border-2 border-[#FF0059] transition-all duration-300 hover:scale-110 disabled:opacity-50 group shadow-lg shadow-[#FF0059]/25"
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
