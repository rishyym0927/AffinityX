"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, X, Camera, ImageIcon } from "lucide-react"
import { useState } from "react"

const galleryImages = [
  { id: 1, src: "/placeholder.svg?height=300&width=300", alt: "Profile photo 1", isPrimary: true },
  { id: 2, src: "/placeholder.svg?height=300&width=300", alt: "Profile photo 2" },
  { id: 3, src: "/placeholder.svg?height=300&width=300", alt: "Profile photo 3" },
  { id: 4, src: "/placeholder.svg?height=300&width=300", alt: "Profile photo 4" },
  { id: 5, src: "/placeholder.svg?height=300&width=300", alt: "Profile photo 5" },
]

export function ProfileGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = () => {
    setIsUploading(true)
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Photo Gallery</h2>
          <p className="text-white/60">Manage your profile photos and showcase your personality</p>
        </div>
        <Button
          onClick={handleImageUpload}
          disabled={isUploading}
          className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-6 py-3 rounded-xl font-semibold"
        >
          <Plus className="h-5 w-5 mr-2" />
          {isUploading ? "Uploading..." : "Add Photo"}
        </Button>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6"
      >
        <div className="flex flex-wrap gap-4">
          {/* Upload Slot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full sm:w-48 h-48 bg-white/5 border-2 border-dashed border-white/20 hover:border-[#FF0059]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 group"
            onClick={handleImageUpload}
          >
            <div className="w-12 h-12 bg-[#FF0059]/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#FF0059]/30 transition-colors">
              <Camera className="h-6 w-6 text-[#FF0059]" />
            </div>
            <span className="text-white/70 font-medium text-sm">Add New Photo</span>
            <span className="text-white/50 text-xs mt-1">JPG, PNG up to 5MB</span>
          </motion.div>

          {/* Existing Images */}
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative w-full sm:w-48 h-48 group cursor-pointer"
              onClick={() => setSelectedImage(image.id)}
            >
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                className="w-full h-full object-cover rounded-2xl border border-white/10 group-hover:border-[#FF0059]/50 transition-all duration-300"
              />

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-3 left-3 bg-[#FF0059] text-white text-xs font-bold px-2 py-1 rounded-full">
                  Primary
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                <div className="flex gap-2">
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-[#FF0059]/10 border border-[#FF0059]/20 rounded-xl">
          <h4 className="font-semibold text-white mb-2">Photo Tips</h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Use high-quality, well-lit photos</li>
            <li>• Show your face clearly in your primary photo</li>
            <li>• Include photos that showcase your interests and lifestyle</li>
            <li>• Avoid group photos where you're hard to identify</li>
          </ul>
        </div>
      </motion.div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-2xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages.find((img) => img.id === selectedImage)?.src || "/placeholder.svg"}
              alt="Selected photo"
              className="w-full h-full object-contain rounded-2xl"
            />
            <Button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
