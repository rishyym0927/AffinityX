"use client"

import { motion } from "framer-motion"
import { Heart, Users, TrendingUp, Clock } from "lucide-react"

const stats = [
  {
    label: "Total Requests",
    value: 47,
    icon: Heart,
    color: "text-[#FF0059]",
    bg: "bg-[#FF0059]/20",
    change: "+12 this week",
  },
  {
    label: "Accepted",
    value: 23,
    icon: Users,
    color: "text-green-400",
    bg: "bg-green-400/20",
    change: "49% acceptance rate",
  },
  {
    label: "Pending",
    value: 8,
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/20",
    change: "Awaiting response",
  },
  {
    label: "This Week",
    value: 12,
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-400/20",
    change: "+3 from last week",
  },
]

export function RequestStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Request Statistics</h3>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-white/80 mb-1">{stat.label}</div>
                <div className="text-xs text-white/60">{stat.change}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-sm font-semibold text-white mb-4">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300">
            <div className="text-sm font-medium text-white">Review all pending</div>
            <div className="text-xs text-white/60">8 requests waiting</div>
          </button>
          <button className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300">
            <div className="text-sm font-medium text-white">View accepted matches</div>
            <div className="text-xs text-white/60">23 successful connections</div>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
