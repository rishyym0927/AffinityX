"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, MessageCircle, Heart, UserCheck, User, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Search", href: "/dashboard", icon: Search },
  { name: "Chatbot", href: "/chatbot", icon: MessageCircle },
  { name: "Matches", href: "/matches", icon: Heart },
  { name: "Requests", href: "/requests", icon: UserCheck },
  { name: "My Profile", href: "/profile", icon: User },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF0059] to-[#FF0059]/80 rounded-xl flex items-center justify-center shadow-lg shadow-[#FF0059]/25 group-hover:shadow-[#FF0059]/40 transition-all duration-300">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Affinity</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-[#FF0059]/20 text-[#FF0059] border border-[#FF0059]/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-[#FF0059]" : ""}`}
                  />
                  <span className="font-medium">{item.name}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#FF0059]/10 rounded-xl border border-[#FF0059]/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative hover:bg-white/10 rounded-xl p-2">
              <Bell className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF0059] rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>

            <Button variant="ghost" size="sm" className="hover:bg-white/10 rounded-xl p-2">
              <Settings className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
            </Button>

            <div className="w-10 h-10 bg-gradient-to-br from-[#FF0059]/20 to-[#FF0059]/10 rounded-full border-2 border-[#FF0059]/30 flex items-center justify-center cursor-pointer hover:border-[#FF0059]/50 transition-all duration-300">
              <User className="h-5 w-5 text-[#FF0059]" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="hover:bg-white/10 rounded-xl p-2">
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-white/70"></div>
                <div className="w-full h-0.5 bg-white/70"></div>
                <div className="w-full h-0.5 bg-white/70"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-[#FF0059]/20 text-[#FF0059]" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
