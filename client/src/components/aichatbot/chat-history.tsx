"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Clock, Trash2, MessageCircle } from "lucide-react"

const chatHistory = [
  {
    id: "1",
    title: "Conversation starters for tech people",
    lastMessage: "Thanks for the great advice!",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "Profile optimization tips",
    lastMessage: "How can I improve my bio?",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    title: "First date planning advice",
    lastMessage: "What are some good first date ideas?",
    timestamp: "3 days ago",
  },
  {
    id: "4",
    title: "Building confidence in dating",
    lastMessage: "I'm feeling nervous about dating...",
    timestamp: "1 week ago",
  },
]

export function ChatHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#FF0059]" />
          <h3 className="text-lg font-semibold text-white">Chat History</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {chatHistory.map((chat, index) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl cursor-pointer transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="h-3 w-3 text-[#FF0059] flex-shrink-0" />
                  <h4 className="font-medium text-white text-sm truncate">{chat.title}</h4>
                </div>
                <p className="text-xs text-white/60 truncate mb-2">{chat.lastMessage}</p>
                <span className="text-xs text-white/50">{chat.timestamp}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
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
