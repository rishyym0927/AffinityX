"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AIChatInterface } from "@/components/aichatbot/ai-chat-interface";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PublicRoute } from "@/components/auth/public-route";

export default function ChatbotPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-black text-white">
        <DashboardNav />

        {/* Main Content with proper spacing from navbar */}
        <main className="pt-24 pb-4 h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto h-full py-4">
            <AIChatInterface />
        </div>
      </main>
    </div>
    </PublicRoute>
  );
}
