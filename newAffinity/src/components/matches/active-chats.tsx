"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"

const activeChats = [
  {
    id: "1",
    name: "Sarah",
    lastMessage: "Hey! Thanks for the match 😊",
    timestamp: "2m",
    unreadCount: 2,
    isOnline: true,
    image: "/src/assets/default.jpg",
  },
  {
    id: "2",
    name: "Jordan",
    lastMessage: "That hiking photo is amazing!",
    timestamp: "1h",
    unreadCount: 0,
    isOnline: true,
    image: "/src/assets/default.jpg",
  },
  {
    id: "3",
    name: "Emily",
    lastMessage: "Would love to chat more",
    timestamp: "3h",
    unreadCount: 1,
    isOnline: false,
    image: "/src/assets/default.jpg",
  },
  {
    id: "4",
    name: "Alex",
    lastMessage: "Coffee sounds great!",
    timestamp: "1d",
    unreadCount: 0,
    isOnline: false,
    image: "/src/assets/default.jpg",
  },
]

export function ActiveChats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#FF0059]" />
          <h3 className="text-lg font-semibold text-white">Active Chats</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          placeholder="Search conversations..."
          className="pl-10 bg-white/5 border-white/20 focus:border-[#FF0059] rounded-xl"
        />
      </div>

      {/* Chat List */}
      <div className="space-y-3">
        {activeChats.map((chat, index) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl cursor-pointer transition-all duration-300"
          >
            <div className="relative">
              <img
                src={chat.image || "/default.jpg"}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {chat.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-black rounded-full"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-white text-sm truncate">{chat.name}</h4>
                <span className="text-xs text-white/50">{chat.timestamp}</span>
              </div>
              <p className="text-xs text-white/60 truncate">{chat.lastMessage}</p>
            </div>

            {chat.unreadCount > 0 && (
              <div className="w-5 h-5 bg-[#FF0059] rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{chat.unreadCount}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10 text-sm"
      >
        View All Conversations
      </Button>
    </motion.div>
  )
}
