"use client";

import { motion } from "framer-motion";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AIChatInterface } from "@/components/aichatbot/ai-chat-interface";

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNav />

      {/* Main Content with proper spacing from navbar */}
      <main className="pt-24 pb-4 h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-full py-4">
          <AIChatInterface />
        </div>
      </main>
    </div>
  );
}
