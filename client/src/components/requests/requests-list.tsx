"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, X, MapPin, Clock, MoreHorizontal, Eye } from "lucide-react"
import { useState } from "react"

const requests = [
  {
    id: "1",
    name: "Maya Patel",
    age: 27,
    location: "San Francisco, CA",
    image: "/src/assets/default.jpg",
    bio: "Software engineer who loves hiking and photography. Looking for meaningful connections.",
    timestamp: "5 min ago",
    compatibility: 94,
    mutualFriends: 3,
    interests: ["Photography", "Hiking", "Tech", "Coffee"],
  },
  {
    id: "2",
    name: "David Chen",
    age: 30,
    location: "Palo Alto, CA",
    image: "/src/assets/default.jpg",
    bio: "Product manager passionate about startups and travel. Always up for an adventure!",
    timestamp: "2 hours ago",
    compatibility: 91,
    mutualFriends: 1,
    interests: ["Travel", "Startups", "Food", "Music"],
  },
  {
    id: "3",
    name: "Lisa Rodriguez",
    age: 25,
    location: "Berkeley, CA",
    image: "/src/assets/default.jpg",
    bio: "Designer and artist who loves exploring new places and trying different cuisines.",
    timestamp: "1 day ago",
    compatibility: 89,
    mutualFriends: 0,
    interests: ["Design", "Art", "Food", "Travel"],
  },
]

export function RequestsList() {
  const [processedRequests, setProcessedRequests] = useState<string[]>([])

  const handleAccept = (requestId: string) => {
    setProcessedRequests((prev) => [...prev, requestId])
    // Handle accept logic
  }

  const handleReject = (requestId: string) => {
    setProcessedRequests((prev) => [...prev, requestId])
    // Handle reject logic
  }

  const activeRequests = requests.filter((request) => !processedRequests.includes(request.id))

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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
                    onClick={() => handleAccept(request.id)}
                    className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-6 py-2 rounded-xl font-semibold"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    variant="outline"
                    className="border-white/20 hover:border-red-500/50 bg-white/5 hover:bg-red-500/10 px-6 py-2 rounded-xl"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
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

      {activeRequests.length === 0 && (
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
