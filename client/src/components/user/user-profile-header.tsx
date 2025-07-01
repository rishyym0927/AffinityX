"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share, Flag, MapPin, Briefcase, GraduationCap, Verified, Wifi, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  age: number
  location: string
  bio: string
  occupation: string
  education: string
  profileImage: string
  compatibility: number
  isOnline: boolean
  lastSeen: string
  distance: string
  verified: boolean
  mutualConnections: number
  responseRate: string
}

interface UserProfileHeaderProps {
  user: User
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF0059]/10 via-transparent to-[#FF0059]/5 pointer-events-none" />

      <div className="relative z-10">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 hover:border-red-500/50 bg-white/5 hover:bg-red-500/10"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>

        {/* Profile Image and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#FF0059]/20 to-[#FF0059]/10 border-4 border-[#FF0059]/30 overflow-hidden">
              <img
                src={user.profileImage || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Online Status */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              {user.isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-white font-medium">Online</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 text-white/50" />
                  <span className="text-xs text-white/70">{user.lastSeen}</span>
                </>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {user.name}, {user.age}
                </h1>
                {user.verified && <Verified className="h-6 w-6 text-blue-400" />}
              </div>

              {/* Compatibility Badge */}
              <div className="bg-gradient-to-r from-[#FF0059] to-[#FF0059]/80 rounded-full px-4 py-2 shadow-lg shadow-[#FF0059]/25">
                <span className="text-white font-bold text-sm">{user.compatibility}% Match</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-white/80 mb-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                <span className="text-sm">
                  {user.location} • {user.distance}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Briefcase className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                <span className="text-sm">{user.occupation}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <GraduationCap className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                <span className="text-sm">{user.education}</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">{user.bio}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-8">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">{user.mutualConnections}</div>
            <div className="text-xs text-white/60 font-medium">Mutual Connections</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">94%</div>
            <div className="text-xs text-white/60 font-medium">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">2.4K</div>
            <div className="text-xs text-white/60 font-medium">Profile Views</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">8 mo</div>
            <div className="text-xs text-white/60 font-medium">On Affinity</div>
          </div>
        </div>

        {/* Response Time Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-400 font-medium text-center sm:text-left">💬 {user.responseRate}</p>
        </div>
      </div>
    </motion.div>
  )
}
