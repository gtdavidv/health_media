# Health Media Chat Application

A full-stack chat application for health media information and support, powered by GPT-5 via LangChain.

## Project Structure

```
health_media/
├── backend/          # Node.js/Express API server
├── frontend/         # React frontend application  
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file (already exists with API key)
# The .env file should contain:
# PORT=3001
# NODE_ENV=development
# OPENAI_KEY=your-api-key-here

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

The frontend will run on `http://localhost:3000`

## Running the Application

### Development Mode

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**:
   - Open browser to `http://localhost:3000`
   - The frontend will automatically proxy API calls to the backend

### Production Mode

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

3. **Access Application**:
   - Open browser to `http://localhost:3001`
   - Backend serves the built React app

## Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- `POST /api/chat` - Chat with health media assistant

## Features

- **Chat Interface**: ChatGPT-style messaging UI
- **Local Storage**: Chat history persisted in browser
- **AI Integration**: GPT-5 powered responses via LangChain
- **Responsive Design**: Mobile and desktop friendly
- **Real-time Status**: Connection status indicator
- **Error Handling**: Graceful error management

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
OPENAI_KEY=your-openai-api-key
```

## Troubleshooting

### Common Issues

1. **API Key Error**:
   - Ensure `` is set in backend/.env
   - Verify the API key is valid and has credits

2. **Port Conflicts**:
   - Backend: Change `PORT` in .env
   - Frontend: Change port in vite.config.js

3. **Dependency Issues**:
   - Delete `node_modules` and run `npm install` again
   - Ensure Node.js version is 18+

4. **GPT-5 Not Available**:
   - Change model to `gpt-4-turbo` or `gpt-4` in backend/routes/chat.js
   - Adjust temperature if needed (0.7 for GPT-4)

### Development Tips

- **Hot Reload**: Both frontend and backend support hot reloading
- **API Proxy**: Frontend automatically proxies `/api` calls to backend
- **Logs**: Check terminal outputs for detailed error messages
- **Browser DevTools**: Use Network tab to debug API calls