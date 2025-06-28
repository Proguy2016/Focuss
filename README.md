# Focuss - Study Collaboration Platform

A modern web application for collaborative study sessions, featuring real-time communication, document sharing, whiteboarding, and task management.

## Features

- **Real-time Collaboration**: Chat, voice calls, and screen sharing
- **Document Sharing**: Upload and manage study materials
- **Interactive Whiteboard**: Collaborate on diagrams and notes
- **Task Management**: Create and track study tasks
- **Project Organization**: Group related resources together
- **Study Library**: Access and share learning resources

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/focuss.git
cd focuss
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

The project includes both a frontend and a mock collaboration server for development.

**To run only the frontend:**
```bash
npm run dev
```

**To run the frontend and mock server together:**
```bash
npm run dev:all
```

The frontend will be available at http://localhost:5173 and the mock WebSocket server runs on port 4000.

## Using the Collaboration Room

1. Open the application in your browser
2. Navigate to the Collaboration section
3. Create a new room or join an existing one using a 6-digit code
4. Start collaborating!

### Room Features

- **Chat**: Send messages and reactions in real-time
- **Whiteboard**: Draw and annotate collaboratively
- **Documents**: Share and view study materials
- **Tasks**: Create and assign tasks to track progress
- **Library**: Access shared learning resources

## Development

The collaboration functionality is structured around Socket.IO for real-time communication. Key components include:

- `CollaborationContext.tsx`: Manages the client-side state and Socket.IO connection
- `StudentCollaborationRoom.tsx`: The main UI component for the collaboration experience
- `server/collaboration-server.js`: A mock WebSocket server for development

### Mock Server

During development, the mock server provides all necessary WebSocket endpoints without requiring a full backend. It supports:

- Room creation and joining
- Real-time messaging
- File sharing
- Collaborative whiteboarding
- Task management
- User presence and status updates

## License

This project is licensed under the MIT License - see the LICENSE file for details. 