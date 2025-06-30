"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { useState, useEffect } from "react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "welcome-message",
    type: "ai",
    content:
      "Hi! I'm your AI dating assistant. I can help you with conversation starters, dating advice, profile optimization, and relationship insights. What would you like to talk about?",
    timestamp: new Date("2024-01-01T00:00:00.000Z"), // Use a fixed timestamp to avoid hydration issues
  },
]

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}-${Math.random()}`,
        type: "ai",
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const getAIResponse = (input: string): string => {
    const responses = [
      "That's a great question! Here's what I'd suggest: Start with something related to their interests shown in their profile. For example, if they mention hiking, you could ask about their favorite trail or recent adventure.",
      "I understand you're looking for dating advice. Remember, authenticity is key in any relationship. Be yourself and focus on building genuine connections rather than trying to impress.",
      "For your profile, I recommend adding more specific details about your hobbies and what you're passionate about. This helps potential matches find common ground with you.",
      "Communication is crucial in dating. Try to ask open-ended questions that encourage meaningful conversations rather than simple yes/no responses.",
    ]
    // Use a deterministic approach based on input length to avoid hydration issues
    const index = input.length % responses.length
    return responses[index]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col"
    >
      {/* Chat Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF0059] to-[#FF0059]/80 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Dating Assistant</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/60">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "ai" && (
              <div className="w-8 h-8 bg-[#FF0059]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-[#FF0059]" />
              </div>
            )}

            <div
              className={`max-w-[80%] p-3 sm:p-4 rounded-2xl ${
                message.type === "user" ? "bg-[#FF0059] text-white" : "bg-white/10 border border-white/20 text-white"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-60">
                  {isClient ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
                {message.type === "ai" && (
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-white/10">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-white/10">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-white/10">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {message.type === "user" && (
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 bg-[#FF0059]/20 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#FF0059]" />
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-white/10 bg-white/5">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask me anything about dating..."
            className="flex-1 bg-white/5 border-white/20 focus:border-[#FF0059] rounded-xl"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-[#FF0059] hover:bg-[#FF0059]/90 px-4 py-2 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
