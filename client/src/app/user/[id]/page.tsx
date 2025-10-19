"use client"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UserProfileHeader } from "@/components/user/user-profile-header"
import { UserProfileGallery } from "@/components/user/user-profile-gallery"
import { UserProfileInfo } from "@/components/user/user-profile-info"
import { UserProfileActions } from "@/components/user/user-profile-actions"
import { SimilarProfiles } from "@/components/user/similar-profiles"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch user profile
        const profileResponse = await api.getProfile(parseInt(userId))
        
        if (profileResponse.error) {
          setError(profileResponse.error)
          return
        }

        const userData = profileResponse.data

        // Fetch user images
        const imagesResponse = await api.getUserImages(parseInt(userId))
        let userImages = ["/default.jpg"] // Default image
        
        if (!imagesResponse.error && imagesResponse.data?.images && imagesResponse.data.images.length > 0) {
          userImages = imagesResponse.data.images.map((img: any) => img.url || img.image_url)
        }

        setImages(userImages)

        // Transform backend data to match component expectations
        const transformedUser = {
          id: userData.ID?.toString() || userId,
          name: userData.Name || "Unknown User",
          age: userData.Age || 0,
          location: userData.City || "Unknown",
          bio: `Lives in ${userData.City || "Unknown"}. Looking for meaningful connections and great conversations.`,
          interests: ["Travel", "Music", "Coffee", "Movies", "Reading"], // Default interests
          socialHabits: ["Social", "Active", "Friendly"], // Default habits
          occupation: "Professional",
          education: "University Graduate",
          profileImage: userImages[0],
          images: userImages,
          compatibility: userData.TotalScore || 0,
          isOnline: Math.random() > 0.5,
          lastSeen: "Recently active",
          distance: "Nearby",
          joinedDate: "2024",
          verified: true,
          mutualConnections: 0,
          responseRate: "Usually responds within a few hours",
          lookingFor: "Meaningful relationship",
          relationshipType: "Single",
          height: "5'8\"",
          languages: ["English"],
        }

        setUser(transformedUser)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load user profile")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav />

      {/* Main Content with proper spacing from navbar */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            // Loading state
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0059] mb-4"></div>
              <p className="text-white/70">Loading profile...</p>
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-400 text-2xl">⚠</span>
              </div>
              <p className="text-red-400 mb-2">Failed to load profile</p>
              <p className="text-white/70 text-sm">{error}</p>
            </div>
          ) : user ? (
            <>
              {/* Profile Header */}
              <UserProfileHeader user={user} />

              {/* Main Content Layout */}
              <div className="flex flex-wrap gap-6 lg:gap-8 mt-8">
                {/* Left Column - Gallery and Actions */}
                <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6 order-2 lg:order-1">
                  <UserProfileGallery images={images} name={user.name} />
                  <UserProfileActions user={user} />
                </div>

                {/* Right Column - Profile Info */}
                <div className="flex-1 min-w-0 order-1 lg:order-2 space-y-6">
                  <UserProfileInfo user={user} />
                  <SimilarProfiles currentUserId={user.id} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}
