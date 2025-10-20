"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Camera, Edit3, Share, MapPin, Briefcase, Calendar, Verified } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

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

interface UserImage {
  id: number
  user_id: number
  image_url: string
  is_primary: boolean
  uploaded_at: string
}

interface ProfileHeaderProps {
  userProfile: UserProfile | null
}

export function ProfileHeader({ userProfile }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [primaryImage, setPrimaryImage] = useState<string>("/default.jpg")
  const [isLoadingImage, setIsLoadingImage] = useState(true)
  const { user } = useAuth()

  // Get name from localStorage as immediate fallback
  const storedName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null
  
  // Use auth context user as fallback for immediate display
  const displayName = userProfile?.Name || user?.name || storedName || "Loading..."
  const displayAge = userProfile?.Age || user?.age
  const displayCity = userProfile?.City || user?.city || "Loading..."
  const displayGender = userProfile?.Gender || user?.gender || ""
  const displayTotalScore = userProfile?.TotalScore || user?.totalScore || 0
  
  // Determine if data is still loading
  const isLoading = !userProfile && !user

  // Fetch user images and find primary
  useEffect(() => {
    const fetchPrimaryImage = async () => {
      setIsLoadingImage(true)
      try {
        const response = await api.listUserImages()
        if (response.data?.images && Array.isArray(response.data.images)) {
          const images: UserImage[] = response.data.images
          const primary = images.find(img => img.is_primary)
          if (primary?.image_url) {
            setPrimaryImage(primary.image_url)
          } else if (images.length > 0 && images[0].image_url) {
            // Use first image if no primary is set
            setPrimaryImage(images[0].image_url)
          }
        }
      } catch (err) {
        console.error("Failed to fetch primary image:", err)
      } finally {
        setIsLoadingImage(false)
      }
    }

    fetchPrimaryImage()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF0059]/10 via-transparent to-[#FF0059]/5 pointer-events-none" />

      <div className="relative z-10">
        {/* Profile Image and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#FF0059]/20 to-[#FF0059]/10 border-4 border-[#FF0059]/30 overflow-hidden">
              {isLoadingImage ? (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0059]"></div>
                </div>
              ) : (
                <Image 
                  width={160} 
                  height={160} 
                  src={primaryImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={() => setPrimaryImage("/default.jpg")}
                />
              )}
            </div>
            <button 
              className="absolute bottom-2 right-2 w-10 h-10 bg-[#FF0059] hover:bg-[#FF0059]/90 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-[#FF0059]/25"
              title="Upload profile photo"
              onClick={() => {
                // Navigate to gallery tab or trigger file upload
                const event = new CustomEvent('openGalleryTab');
                window.dispatchEvent(event);
              }}
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {displayName}
                </h1>
                <Verified className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:border-[#FF0059]/50 bg-white/5 hover:bg-white/10"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-white/80">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                <span className="text-sm">
                  {isLoading ? (
                    <span className="inline-block w-32 h-4 bg-white/10 rounded animate-pulse"></span>
                  ) : (
                    `${displayCity}${displayAge ? `, Age: ${displayAge}` : ""}`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Briefcase className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                <span className="text-sm">Software Engineer at Tech Company</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Calendar className="h-4 w-4 text-[#FF0059] flex-shrink-0" />
                <span className="text-sm">
                  Member since 2024
                </span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl">
              {isLoading ? (
                <>
                  <span className="inline-block w-full h-4 bg-white/10 rounded animate-pulse mb-2"></span>
                  <span className="inline-block w-3/4 h-4 bg-white/10 rounded animate-pulse"></span>
                </>
              ) : (
                <>
                  Gender: {displayGender === 'M' ? 'Male' : displayGender === 'F' ? 'Female' : 'Not specified'} | 
                  Total Score: {displayTotalScore} | 
                  Passionate about connecting with like-minded individuals and building meaningful relationships. 
                  When I'm not working, you'll find me exploring new places and trying new experiences around the city.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-8">
          {[
            { label: "Profile Views", value: "2.4K" },
            { label: "Matches", value: "156" },
            { label: "Response Rate", value: "94%" },
            { label: "Active Since", value: "8 months" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/60 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
