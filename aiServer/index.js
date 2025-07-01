const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const dotenv = require('dotenv');
dotenv.config();
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Mongoose models
const ChatHistory = mongoose.model('ChatHistory', new mongoose.Schema({
  userId: String,
  title: String,
  createdAt: { type: Date, default: Date.now },
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  chatHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatHistory' },
  sender: String, // "user" or "bot"
  content: String,
  createdAt: { type: Date, default: Date.now },
}));

// Gemini config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_API_URL;

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AffinityX AI Server is running!', status: 'healthy' });
});

app.post('/chat-history', async (req, res) => {
  const { userId, title } = req.body;
  const chat = await ChatHistory.create({ userId, title });
  res.json(chat);
});

app.get('/chat-history/:userId', async (req, res) => {
  const { userId } = req.params;
  const chats = await ChatHistory.find({ userId }).sort({ createdAt: -1 });
  res.json(chats);
});

app.get('/messages/:chatHistoryId', async (req, res) => {
  const { chatHistoryId } = req.params;
  const messages = await Message.find({ chatHistoryId }).sort({ createdAt: 1 });
  res.json(messages);
});

// WebSocket handler
io.on('connection', (socket) => {
  console.log('Socket connected');

  socket.on('sendMessage', async ({ userId, chatHistoryId, content, ...userTraits }) => {
    try {
      let actualChatHistoryId = chatHistoryId;
      
      // If no chatHistoryId provided or invalid, create new chat history
      if (!chatHistoryId || chatHistoryId === "new" || !mongoose.Types.ObjectId.isValid(chatHistoryId)) {
        // Generate a title from the first message (truncated)
        const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
        
        const newChatHistory = await ChatHistory.create({
          userId,
          title,
        });
        
        actualChatHistoryId = newChatHistory._id;
        console.log(`📝 Created new chat history: ${actualChatHistoryId}`);
      }

      // Save user message
      const userMsg = await Message.create({
        chatHistoryId: actualChatHistoryId,
        sender: 'user',
        content,
      });

      // Prepare prompt for natural conversation
      const conversationPrompt = `
You are a friendly, supportive AI dating assistant. Your role is to help users with dating advice, conversation tips, relationship insights, and general support in their romantic life.

About this user:
- They're from ${userTraits.location}
- Their interests include: ${userTraits.interests}
- They're looking for: ${userTraits.relation_type}
- Their personality traits: ${userTraits.traits}
- They value: ${userTraits.values}
- Their communication style: ${userTraits.style}

User's message: "${content}"

Please respond in a warm, conversational, and helpful manner. Be supportive, understanding, and give practical advice when relevant. Keep your response natural and friendly - like talking to a good friend who happens to be really good at dating advice. Don't mention scores, ratings, or any technical details. Just focus on being genuinely helpful and encouraging.
`;

      const response = await axios.post(
        `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: conversationPrompt }] }]
        }
      );

      const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I'm having trouble responding right now. Could you try asking me again?";

      // Save bot reply (clean response without any scores)
      const botMsg = await Message.create({
        chatHistoryId: actualChatHistoryId,
        sender: 'bot',
        content: botReply,
      });

      // POST score to external API (commented out as we're no longer generating scores)
      // if (score !== null && !isNaN(score)) {
      //   await axios.post('http://localhost:7125', {
      //     user_id: userTraits.user_id,
      //     score,
      //   });
      // }

      // Send the natural conversation response
      socket.emit('botReply', {
        userMessage: userMsg,
        botMessage: botMsg,
        chatHistoryId: actualChatHistoryId,
      });

    } catch (err) {
      console.error(err);
      socket.emit('botReply', { error: 'Failed to process message.' });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
