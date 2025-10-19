# API Package Structure

The API package has been refactored into smaller, more maintainable components for better organization and separation of concerns.

## File Organization

### Core Files

- **`server.go`** - Server struct definition and constructor
  - Contains the main `Server` struct
  - `NewServer()` constructor function

- **`types.go`** - Request/Response types and constants
  - All API request/response structs
  - Constants for limits, scores, etc.

- **`routes.go`** - HTTP route configuration
  - `Routes()` - Main router setup
  - `setupMiddleware()` - Middleware configuration
  - `setupPublicRoutes()` - Public endpoint configuration
  - `setupProtectedRoutes()` - Protected endpoint configuration
  - `health()` - Health check endpoint

- **`middleware.go`** - Authentication middleware
  - `AuthMiddleware()` - JWT authentication
  - `userIDFromCtx()` - Extract user ID from context

### Handler Files

Each handler file contains related HTTP handlers:

- **`handlers_auth.go`** - Authentication handlers
  - `signup()` - User registration
  - `login()` - User authentication

- **`handlers_user.go`** - User profile and image management
  - `getProfile()` - Get user profile
  - `uploadUserImages()` - Upload multiple images
  - `listUserImages()` - List user images
  - `setPrimaryImage()` - Set primary profile picture
  - `deleteUserImage()` - Delete an image
  - `processImageUploads()` - Helper for image processing

- **`handlers_chatbot.go`** - Chatbot functionality
  - `submitScore()` - Submit personality scores

- **`handlers_match.go`** - Matching functionality
  - `matchRecommendations()` - Get match recommendations
  - `matchRequest()` - Send match request
  - `matchRespond()` - Accept/reject match request
  - `getIncomingRequests()` - Get incoming match requests

- **`handlers_chat.go`** - Chat functionality
  - `chatSend()` - Send a message
  - `chatGet()` - Retrieve chat messages

### Helper Files

- **`helpers.go`** - Utility functions
  - Validation functions (`validateSignupRequest()`, `validateScores()`)
  - Parsing functions (`parseMatchPreferences()`)
  - JWT functions (`createToken()`)
  - Response helpers (`responseJSON()`, `errorJSON()`)

## Benefits of This Structure

1. **Separation of Concerns** - Each file has a single, clear responsibility
2. **Easier Navigation** - Find handlers quickly by feature area
3. **Better Maintainability** - Smaller files are easier to understand and modify
4. **Improved Testability** - Handlers can be tested independently
5. **Team Collaboration** - Reduces merge conflicts when multiple developers work on different features
6. **Code Reusability** - Helper functions are centralized and easily accessible

## Adding New Features

When adding new functionality:

1. Add request/response types to `types.go`
2. Add routes to `routes.go` (public or protected)
3. Create handlers in the appropriate `handlers_*.go` file
4. Add any helpers/validation to `helpers.go`

Example: To add a new "likes" feature:
- Create `handlers_likes.go` with like-related handlers
- Add route configuration in `routes.go`
- Add request/response types in `types.go`
