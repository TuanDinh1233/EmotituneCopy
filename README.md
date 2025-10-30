# EmotiTunes Setup Guide

This guide will help you set up and run both the backend and frontend of the EmotiTunes application.

## Prerequisites

Before you begin, make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- Git

## Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/eky2429/EmotiTunes.git
cd EmotiTunes
```

## Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install backend dependencies:
```bash
npm install
```

3. Set up Spotify API credentials:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Log in with your Spotify account (create one if needed)
   - Create a new application
   - Copy your Client ID and Client Secret
   - Create a `.env` file in the server directory with the following content:
     ```
     SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     ```
   - Replace `your_client_id_here` and `your_client_secret_here` with your actual Spotify API credentials

4. Start the backend server:
```bash
npm start
```

The backend server will start running on `http://localhost:3001`

## Frontend Setup

1. Install the HTTP server globally (if not already installed):
```bash
npm install -g http-server
```

2. From the project root directory, start the frontend server:
```bash
cd frontend
http-server -p 8080 --cors
```

The frontend will be available at `http://localhost:8080`

## Verifying the Setup

1. Make sure both servers are running:
   - Backend: `http://localhost:3001`
   - Frontend: `http://localhost:8080`

2. Test the backend API:
   - Open your browser or use curl to test the search endpoint:
   ```bash
   curl "http://localhost:3001/api/search?query=happy"
   ```
   You should receive JSON data with song information.

3. Access the frontend:
   - Open your browser and navigate to `http://localhost:8080`
   - The EmotiTunes application should load and be fully functional

## Troubleshooting

1. **Port Already in Use**
   If you see an error about the port being in use, you can either:
   - Kill the process using the port:
     ```bash
     lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
     ```
   - Or use a different port by modifying the port number in the server code

2. **CORS Issues**
   - Make sure you're using the http-server with the --cors flag
   - Ensure you're accessing the frontend through http://localhost:8080 and not directly opening the HTML file

3. **Spotify API Issues**
   - Verify your credentials in the .env file
   - Make sure your Spotify application is properly configured in the Spotify Developer Dashboard

## Development

- Backend code is in the `server` directory
- Frontend code is in the `frontend` directory
- The backend will automatically reload when you make changes (using nodemon)
- Frontend changes will be reflected immediately upon browser refresh

## API Documentation

The backend provides the following endpoint:

- **Search Songs**
  - URL: `http://localhost:3001/api/search`
  - Method: GET
  - Query Parameters: 
    - `query`: The search term for songs
  - Example: `http://localhost:3001/api/search?query=happy`