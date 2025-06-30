"use client"
import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/features-grid"

import { CTASection } from "@/components/cta-section"
import { TechStack } from "@/components/tech-stack"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        
        <HeroSection />
        <FeaturesGrid />
        <CTASection />
        <TechStack />

      </main>
    </div>
  )
}
