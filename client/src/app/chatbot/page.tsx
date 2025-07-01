"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AIChatInterface } from "@/components/aichatbot/ai-chat-interface";
import { PublicRoute } from "@/components/auth/public-route";
import { ChatHistory } from "@/components/aichatbot/chat-history";
import { ChatSuggestions } from "@/components/aichatbot/chat-suggestions";
import { motion } from "framer-motion";
export default function ChatbotPage() {
  return (
    <PublicRoute>
       <div className="min-h-screen bg-black text-white">
      <DashboardNav />

      {/* Main Content with proper spacing from navbar */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">AI Dating Assistant</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Get personalized dating advice, conversation starters, and relationship insights from our AI assistant.
            </p>
          </motion.div>

          {/* Flex-based responsive layout */}
          <div className="flex flex-wrap gap-6 lg:gap-8">
            {/* Left Sidebar - Chat History & Suggestions */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6 order-2 lg:order-1">
              <ChatHistory />
              <ChatSuggestions />
            </div>

            {/* Center - Main Chat Interface */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">
              <AIChatInterface />
            </div>
          </div>
        </div>
      </main>
    </div>
    </PublicRoute>
  );
}
