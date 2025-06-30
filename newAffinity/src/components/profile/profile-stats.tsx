"use client"

import { motion } from "framer-motion"
import { TrendingUp, Heart, Users, MessageCircle, Eye, Star, Zap, Calendar } from "lucide-react"

const stats = [
  { label: "Total Likes", value: 847, icon: Heart, color: "text-[#FF0059]", bg: "bg-[#FF0059]/20", change: "+12%" },
  { label: "Matches", value: 156, icon: Users, color: "text-green-400", bg: "bg-green-400/20", change: "+8%" },
  { label: "Messages", value: 423, icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/20", change: "+15%" },
  { label: "Profile Views", value: 2847, icon: Eye, color: "text-purple-400", bg: "bg-purple-400/20", change: "+23%" },
  { label: "Super Likes", value: 34, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/20", change: "+5%" },
  { label: "Rating", value: 4.8, icon: Star, color: "text-orange-400", bg: "bg-orange-400/20", change: "+0.2" },
]

const weeklyActivity = [
  { day: "Mon", likes: 12, matches: 3 },
  { day: "Tue", likes: 18, matches: 5 },
  { day: "Wed", likes: 8, matches: 2 },
  { day: "Thu", likes: 22, matches: 7 },
  { day: "Fri", likes: 15, matches: 4 },
  { day: "Sat", likes: 28, matches: 9 },
  { day: "Sun", likes: 20, matches: 6 },
]

export function ProfileStats() {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-[#FF0059]" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Profile Analytics</h3>
        </div>

        <div className="space-y-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{stat.label}</div>
                  <div className="text-xs text-white/60">This month</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-lg">{stat.value}</div>
                <div
                  className={`text-xs font-medium ${stat.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                >
                  {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-[#FF0059]" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Weekly Activity</h3>
        </div>

        <div className="space-y-4">
          {weeklyActivity.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 text-xs font-medium text-white/60">{day.day}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF0059] to-[#FF0059]/80 rounded-full transition-all duration-500"
                    style={{ width: `${(day.likes / 30) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-white/70 w-8 text-right">{day.likes}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
