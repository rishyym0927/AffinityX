"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, MoreHorizontal, MapPin, Clock } from "lucide-react"
import { useState } from "react"

const matches = [
  {
    id: "1",
    name: "Sarah Chen",
    age: 28,
    location: "San Francisco, CA",
    image: "/src/assets/default.jpg",
    lastMessage: "Hey! Thanks for the match 😊",
    timestamp: "2 min ago",
    isOnline: true,
    compatibility: 95,
    hasUnread: true,
  },
  {
    id: "2",
    name: "Emily Watson",
    age: 26,
    location: "Seattle, WA",
    image: "/src/assets/default.jpg",
    lastMessage: "I love your profile! We should chat more",
    timestamp: "1 hour ago",
    isOnline: false,
    compatibility: 92,
    hasUnread: false,
  },
  {
    id: "3",
    name: "Jordan Kim",
    age: 29,
    location: "Los Angeles, CA",
    image: "/src/assets/default.jpg",
    lastMessage: "That hiking photo is amazing! Where was it taken?",
    timestamp: "3 hours ago",
    isOnline: true,
    compatibility: 90,
    hasUnread: true,
  },
  {
    id: "4",
    name: "Alex Rivera",
    age: 31,
    location: "Austin, TX",
    image: "/src/assets/default.jpg",
    lastMessage: "Would love to grab coffee sometime!",
    timestamp: "1 day ago",
    isOnline: false,
    compatibility: 88,
    hasUnread: false,
  },
]

export function MatchesList() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

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

      <div className="space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl cursor-pointer transition-all duration-300 ${
              selectedMatch === match.id ? "border-[#FF0059]/50 bg-[#FF0059]/5" : ""
            }`}
            onClick={() => setSelectedMatch(match.id)}
          >
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={match.image || "/default.jpg"}
                  alt={match.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                />
                {match.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-black rounded-full"></div>
                )}
                {match.hasUnread && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF0059] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">!</span>
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

                <p className="text-sm text-white/70 truncate mb-2">{match.lastMessage}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/50">{match.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-[#FF0059] hover:bg-[#FF0059]/90 h-8 px-3 rounded-lg">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <Button
        variant="outline"
        className="w-full mt-6 border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10"
      >
        Load More Matches
      </Button>
    </motion.div>
  )
}
