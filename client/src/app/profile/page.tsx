"use client"

import { motion } from "framer-motion"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileGallery } from "@/components/profile/profile-gallery"
import { ProfileInfo } from "@/components/profile/profile-info"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api, getUserId } from "@/lib/api"

// User profile interface to match actual API response
interface UserProfile {
  ID: number
  Name: string
  Age: number
  City: string
  Gender: string
  Lat: number
  Lon: number
  Communication: number
  Confidence: number
  Emotional: number
  Personality: number
  TotalScore: number
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const userId = getUserId()
        if (!userId) {
          setError("User ID not found")
          return
        }

        const response = await api.getProfile(parseInt(userId))
        console.log("Profile fetch response:", response)
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setUserProfile(response.data)
        }
      } catch (err) {
        setError("Failed to fetch profile data")
        console.error("Profile fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserProfile()
    }
  }, [user])

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <DashboardNav />
          <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0059] mx-auto mb-4"></div>
                  <p className="text-white/70">Loading profile...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <DashboardNav />
          <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-400 text-2xl">⚠</span>
                  </div>
                  <p className="text-red-400 mb-4">Failed to load profile</p>
                  <p className="text-white/70 text-sm">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[#FF0059] hover:bg-[#FF0059]/90 rounded-lg text-white transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <DashboardNav />

        {/* Main Content with proper spacing from navbar */}
        <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader userProfile={userProfile} />

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2"
          >
            {[
              { id: "overview", label: "Overview" },
              { id: "gallery", label: "Gallery" },
              { id: "info", label: "Personal Info" },
              { id: "settings", label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#FF0059] text-white shadow-lg shadow-[#FF0059]/25"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === "overview" && (
              <div className="flex flex-wrap gap-6 lg:gap-8">
                <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                  <ProfileStats userProfile={userProfile} />
                </div>
                <div className="flex-1 min-w-0">
                  <ProfileInfo userProfile={userProfile} />
                </div>
              </div>
            )}

            {activeTab === "gallery" && <ProfileGallery />}

            {activeTab === "info" && <ProfileInfo detailed userProfile={userProfile} />}

            {activeTab === "settings" && <ProfileSettings />}
          </motion.div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
