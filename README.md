# AffinityX - Dating Platform API Documentation

AffinityX is a modern dating platform that combines intelligent matching algorithms with AI-powered conversation assistance. The platform consists of multiple microservices providing comprehensive dating functionalities.

## 🏗️ Architecture

The system consists of three main services:
- **Match Backend** (Go) - Main API service for user management, matching, and chat
- **AI Server** (Node.js) - AI chatbot service powered by Google Gemini
- **Client** (Next.js) - Frontend application

## 🚀 Services

### 1. Match Backend Service
**Base URL:** `http://localhost:8080`  
**Technology:** Go with Chi router  
**Database:** PostgreSQL  
**Storage:** Cloudinary (for image uploads)

### 2. AI Server Service
**Base URL:** `http://localhost:3001`  
**Technology:** Node.js with Express & Socket.io  
**Database:** MongoDB  
**AI Provider:** Google Gemini API

### 3. Client Application
**Base URL:** `http://localhost:3000`  
**Technology:** Next.js with TypeScript  
**Authentication:** JWT with localStorage

## 📚 API Endpoints

## Match Backend APIs

### 🔐 Authentication Endpoints

#### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok"
}
```

#### User Registration
```http
POST /api/auth/signup
```
**Headers:**
```
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "M",
  "age": 25,
  "city": "Mumbai"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user_id": 123
}
```

#### User Login
```http
POST /api/auth/login
```
**Headers:**
```
Content-Type: application/json
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user_id": 123
}
```

### 👤 User Profile Endpoints

#### Get User Profile
```http
GET /api/user/profile/{id}
```
**Headers:**
```
Authorization: Bearer {jwt_token}
```
**Response:**
```json
{
  "user_id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "gender": "M",
  "age": 25,
  "city": "Mumbai",
  "lat": 19.0760,
  "lon": 72.8777,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 🤖 Chatbot Score Endpoints

#### Submit Personality Score
```http
POST /api/chatbot/submit-score
```
**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "personality": 85,
  "communication": 78,
  "emotional": 90,
  "confidence": 82
}
```
**Response:**
```json
{
  "message": "score updated",
  "total_score": 84
}
```

### 💕 Matching Endpoints

#### Get Match Recommendations
```http
GET /api/match/recommendations?gender=F&age_min=22&age_max=30&limit=10
```
**Headers:**
```
Authorization: Bearer {jwt_token}
```
**Query Parameters:**
- `gender` (optional): Target gender (M/F)
- `age_min` (optional): Minimum age filter
- `age_max` (optional): Maximum age filter  
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "candidates": [
    {
      "user_id": 456,
      "name": "Jane Smith",
      "age": 24,
      "city": "Mumbai",
      "gender": "F",
      "total_score": 88,
      "distance_km": 5.2
    }
  ]
}
```

#### Send Match Request
```http
POST /api/match/request
```
**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "receiver_id": 456
}
```
**Response:**
```json
{
  "message": "request sent"
}
```

#### Respond to Match Request
```http
POST /api/match/respond
```
**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "sender_id": 789,
  "accept": true
}
```
**Response:**
```json
{
  "message": "accepted"
}
```

### 💬 Chat Endpoints

#### Send Chat Message
```http
POST /api/chat/send
```
**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```
**Request Body:**
```json
{
  "match_id": 123,
  "message": "Hey! How's your day going?"
}
```
**Response:**
```json
{
  "message": "sent"
}
```

#### Get Chat Messages
```http
GET /api/chat/{match_id}
```
**Headers:**
```
Authorization: Bearer {jwt_token}
```
**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "match_id": 123,
      "sender_id": 456,
      "body": "Hey! How's your day going?",
      "sent_at": "2024-01-01T10:30:00Z"
    }
  ]
}
```

### 🖼️ Image Upload Endpoints

#### Upload User Images
```http
POST /api/user/upload
```
**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```
**Form Data:**
```
images: [File, File, ...]
```
**Response:**
```json
{
  "message": "upload successful",
  "uploaded": [
    "https://res.cloudinary.com/..../image1.jpg",
    "https://res.cloudinary.com/..../image2.jpg"
  ]
}
```

#### List User Images
```http
GET /api/user/images
```
**Headers:**
```
Authorization: Bearer {jwt_token}
```
**Response:**
```json
{
  "images": [
    {
      "id": 1,
      "user_id": 123,
      "object_name": "user/123/image1.jpg",
      "public_url": "https://res.cloudinary.com/..../image1.jpg",
      "is_primary": true,
      "uploaded_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### Set Primary Image
```http
POST /api/user/image/{id}/primary
```
**Headers:**
```
Authorization: Bearer {jwt_token}
```
**Response:**
```json
{
  "message": "primary image set"
}
```

#### Delete User Image
```http
DELETE /api/user/image/{id}/delete
```
**Headers:**
```
Authorization: Bearer {jwt_token}
```
**Response:**
```json
{
  "message": "deleted"
}
```

## AI Server APIs

### 🤖 AI Chatbot Endpoints

#### Health Check
```http
GET /
```
**Response:**
```json
{
  "message": "AffinityX AI Server is running!",
  "status": "healthy"
}
```

#### Create Chat History
```http
POST /chat-history
```
**Headers:**
```
Content-Type: application/json
```
**Request Body:**
```json
{
  "userId": "user123",
  "title": "Dating advice chat"
}
```
**Response:**
```json
{
  "_id": "chat_history_id",
  "userId": "user123",
  "title": "Dating advice chat",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

#### Get Chat History
```http
GET /chat-history/{userId}
```
**Response:**
```json
[
  {
    "_id": "chat_history_id",
    "userId": "user123",
    "title": "Dating advice chat",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

#### Get Messages
```http
GET /messages/{chatHistoryId}
```
**Response:**
```json
[
  {
    "_id": "message_id",
    "chatHistoryId": "chat_history_id",
    "sender": "user",
    "content": "I need dating advice",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  {
    "_id": "message_id2",
    "chatHistoryId": "chat_history_id", 
    "sender": "bot",
    "content": "I'd be happy to help! What specific aspect of dating would you like advice on?",
    "createdAt": "2024-01-01T10:01:00Z"
  }
]
```

### 🔌 WebSocket Events

#### Connection
```javascript
const socket = io('http://localhost:3001');
```

#### Send Message
**Event:** `sendMessage`
**Data:**
```json
{
  "userId": "user123",
  "chatHistoryId": "chat_id_or_new",
  "content": "I need help with my dating profile",
  "location": "Mumbai",
  "interests": "photography, hiking, coffee",
  "relation_type": "serious relationship",
  "traits": "introverted, creative, ambitious",
  "values": "honesty, loyalty, growth",
  "style": "thoughtful, direct, humorous"
}
```

#### Receive Bot Reply
**Event:** `botReply`
**Data:**
```json
{
  "userMessage": {
    "_id": "msg_id1",
    "chatHistoryId": "chat_id",
    "sender": "user",
    "content": "I need help with my dating profile",
    "createdAt": "2024-01-01T10:00:00Z"
  },
  "botMessage": {
    "_id": "msg_id2",
    "chatHistoryId": "chat_id",
    "sender": "bot", 
    "content": "I'd love to help you improve your dating profile! A great profile showcases your personality and interests authentically...",
    "createdAt": "2024-01-01T10:01:00Z"
  },
  "chatHistoryId": "chat_id"
}
```

## 🗄️ Database Schema

### PostgreSQL Tables (Match Backend)

#### Users Table
```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    age SMALLINT CHECK (age BETWEEN 18 AND 100),
    city VARCHAR(100),
    lat DOUBLE PRECISION DEFAULT 0,
    lon DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Scores Table
```sql
CREATE TABLE scores (
    user_id BIGINT PRIMARY KEY REFERENCES users(user_id),
    total_score SMALLINT CHECK (total_score BETWEEN 0 AND 100),
    personality SMALLINT CHECK (personality BETWEEN 0 AND 100),
    communication SMALLINT CHECK (communication BETWEEN 0 AND 100),
    emotional SMALLINT CHECK (emotional BETWEEN 0 AND 100),
    confidence SMALLINT CHECK (confidence BETWEEN 0 AND 100)
);
```

#### Match Requests Table
```sql
CREATE TABLE match_requests (
    id SERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(user_id),
    receiver_id BIGINT NOT NULL REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);
```

#### Matches Table
```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user1_id BIGINT REFERENCES users(user_id),
    user2_id BIGINT REFERENCES users(user_id),
    matched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES matches(id),
    sender_id BIGINT NOT NULL REFERENCES users(user_id),
    body TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW()
);
```

#### User Images Table
```sql
CREATE TABLE user_images (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    object_name TEXT NOT NULL,
    public_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### MongoDB Collections (AI Server)

#### ChatHistory Collection
```json
{
  "_id": "ObjectId",
  "userId": "String",
  "title": "String",
  "createdAt": "Date"
}
```

#### Message Collection
```json
{
  "_id": "ObjectId",
  "chatHistoryId": "ObjectId",
  "sender": "String", // "user" or "bot"
  "content": "String",
  "createdAt": "Date"
}
```

## 🔧 Configuration

### Environment Variables

#### Match Backend (.env)
```env
PORT=8080
POSTGRES_DSN=postgres://username:password@localhost/affinityx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### AI Server (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/affinityx_ai
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

### CORS Configuration

The Match Backend is configured to accept requests from:
- `http://localhost:3000` (Next.js client)

Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

## 🛠️ Development Setup

### Prerequisites
- Go 1.19+
- Node.js 18+
- PostgreSQL 13+
- MongoDB 6+
- Cloudinary account
- Google Gemini API key

### Running the Services

#### 1. Match Backend
```bash
cd match_backend
go mod tidy
go run cmd/server/main.go
```

#### 2. AI Server
```bash
cd aiServer
npm install
npm start
```

#### 3. Client
```bash
cd client
npm install
npm run dev
```

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. **Registration/Login**: Client sends credentials to `/api/auth/signup` or `/api/auth/login`
2. **Token Response**: Server returns JWT token and user ID
3. **Protected Requests**: Client includes token in `Authorization: Bearer {token}` header
4. **Token Validation**: Server validates JWT on protected routes using middleware

### Token Structure
```json
{
  "user_id": 123,
  "exp": 1704067200
}
```

## 📊 Matching Algorithm

The matching system uses multiple factors:

1. **Compatibility Scores**: Based on personality, communication, emotional intelligence, and confidence
2. **Age Preferences**: Configurable age range filtering
3. **Gender Preferences**: Target gender selection
4. **Location Proximity**: Distance-based matching (when coordinates available)
5. **User Exclusions**: Previously rejected/blocked users are filtered out

### Scoring System
- Each user has scores in 4 categories (0-100)
- Total score is calculated as average of all categories
- Minimum score threshold can be configured (default: 60)

## 🚀 Deployment

### Production Considerations

1. **Security**:
   - Use strong JWT secrets (from environment variables)
   - Enable HTTPS for all services
   - Implement rate limiting
   - Add input validation and sanitization

2. **Database**:
   - Use connection pooling
   - Enable database backups
   - Monitor query performance

3. **Scaling**:
   - Use load balancers for multiple instances
   - Implement Redis for session management
   - Consider microservice containerization

4. **Monitoring**:
   - Add health check endpoints
   - Implement logging and metrics
   - Set up error tracking

## 📝 API Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Invalid/missing token |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For more information or support, please contact the development team.
