"use client"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UserProfileHeader } from "@/components/user/user-profile-header"
import { UserProfileGallery } from "@/components/user/user-profile-gallery"
import { UserProfileInfo } from "@/components/user/user-profile-info"
import { UserProfileActions } from "@/components/user/user-profile-actions"
import { SimilarProfiles } from "@/components/user/similar-profiles"
import { useParams } from "next/navigation"

// Mock user data - in real app, this would come from API
const getUserData = (id: string) => {
  const users = {
    "1": {
      id: "1",
      name: "Sarah Chen",
      age: 28,
      location: "San Francisco, CA",
      bio: "Full-stack developer passionate about AI and machine learning. Love hiking and exploring new coffee shops around the city. Always excited to meet fellow tech enthusiasts who share my love for innovation and outdoor adventures.",
      interests: ["React", "Python", "AI/ML", "Hiking", "Coffee", "Photography", "Travel", "Yoga"],
      socialHabits: ["Social drinker", "Non-smoker", "Gym enthusiast", "Early bird"],
      occupation: "Senior Software Engineer at Stripe",
      education: "Stanford University - Computer Science",
      profileImage: "/placeholder.svg?height=400&width=300",
      images: [
        "/placeholder.svg?height=400&width=300",
        "/placeholder.svg?height=400&width=300",
        "/placeholder.svg?height=400&width=300",
        "/placeholder.svg?height=400&width=300",
        "/placeholder.svg?height=400&width=300",
      ],
      compatibility: 95,
      isOnline: true,
      lastSeen: "Active now",
      distance: "2 miles away",
      joinedDate: "March 2024",
      verified: true,
      mutualConnections: 5,
      responseRate: "Usually responds within an hour",
      lookingFor: "Long-term relationship",
      relationshipType: "Single",
      height: "5'6\"",
      languages: ["English", "Mandarin", "Spanish"],
    },
  // Add more users as needed
  }

  return users[id as keyof typeof users] || users["1"]
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const user = getUserData(userId)

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav />

      {/* Main Content with proper spacing from navbar */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <UserProfileHeader user={user} />

          {/* Main Content Layout */}
          <div className="flex flex-wrap gap-6 lg:gap-8 mt-8">
            {/* Left Column - Gallery and Actions */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6 order-2 lg:order-1">
              <UserProfileGallery images={user.images} name={user.name} />
              <UserProfileActions user={user} />
            </div>

            {/* Right Column - Profile Info */}
            <div className="flex-1 min-w-0 order-1 lg:order-2 space-y-6">
              <UserProfileInfo user={user} />
              <SimilarProfiles currentUserId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
