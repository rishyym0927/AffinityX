"use client"

import { motion } from "framer-motion"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileGallery } from "@/components/profile/profile-gallery"
import { ProfileInfo } from "@/components/profile/profile-info"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { useState } from "react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav />

      {/* Main Content with proper spacing from navbar */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader />

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
                  <ProfileStats />
                </div>
                <div className="flex-1 min-w-0">
                  <ProfileInfo />
                </div>
              </div>
            )}

            {activeTab === "gallery" && <ProfileGallery />}

            {activeTab === "info" && <ProfileInfo detailed />}

            {activeTab === "settings" && <ProfileSettings />}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
