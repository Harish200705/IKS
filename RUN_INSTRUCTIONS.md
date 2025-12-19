# How to Run the Veterinary Website Project

## Prerequisites

Before running the project, make sure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **MongoDB Atlas account** (or local MongoDB) - The project uses MongoDB Atlas

## Quick Start (Using the Start Script)

The easiest way to run the project is using the provided start script:

```bash
# Navigate to the project directory
cd /Volumes/🦋2001/Harish/veterinary-website

# Make the script executable (first time only)
chmod +x start.sh

# Run the start script
./start.sh
```

This will:
- Start the backend server on port 5001
- Start the frontend server on port 3000
- Automatically seed the database (if needed)

## Manual Setup (Step by Step)

### Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd /Volumes/🦋2001/Harish/veterinary-website/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Check MongoDB connection:**
   - The MongoDB connection string is already configured in `server.js`
   - Connection: `mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases`
   - Database: `Diseases`
   - Collections: Various disease collections (cowAndBuffalo, PoultryBirds, SheepGoat, etc.)

4. **Start the backend server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # OR production mode
   npm start
   ```

   The backend will run on: **http://localhost:5001**

5. **Verify backend is running:**
   - Open browser: http://localhost:5001/api/test
   - You should see a JSON response with collection counts

### Step 2: Frontend Setup

1. **Open a new terminal window** (keep backend running)

2. **Navigate to frontend directory:**
   ```bash
   cd /Volumes/🦋2001/Harish/veterinary-website/frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the frontend server:**
   ```bash
   npm start
   ```

   The frontend will run on: **http://localhost:3000**

5. **The browser should automatically open** to http://localhost:3000

## Running Both Servers

You need **two terminal windows**:

### Terminal 1 - Backend:
```bash
cd /Volumes/🦋2001/Harish/veterinary-website/backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd /Volumes/🦋2001/Harish/veterinary-website/frontend
npm start
```

## API Endpoints

Once the backend is running, you can test these endpoints:

### Test Database Connection
```
GET http://localhost:5001/api/test
```
Returns collection counts for all disease collections.

### Search Diseases
```
GET http://localhost:5001/api/search?query=<search_term>&collection=<category>&language=<lang>
```
Example:
```
GET http://localhost:5001/api/search?query=fever&collection=cowAndBuffalo&language=en
```

### Get Disease by ID
```
GET http://localhost:5001/api/disease/:collection/:id
```
Example:
```
GET http://localhost:5001/api/disease/cowAndBuffalo/507f1f77bcf86cd799439011
```

### Get All Diseases in Collection
```
GET http://localhost:5001/api/diseases/:collection
```
Example:
```
GET http://localhost:5001/api/diseases/PoultryBirds
```

### Chatbot API
```
POST http://localhost:5001/api/chat
Body: { "message": "What is fever?", "language": "en" }
```

## Available Collections

The project supports the following MongoDB collections:

### cowAndBuffalo
- `cowAndBuffalo` (English)
- `cowAndBuffaloTamil`
- `cowAndBuffaloHindi`
- `cowAndBuffaloMalayalam`

### PoultryBirds
- `PoultryBirds` (English)
- `PoultryBirdsHindi`
- `PoultryBirdsTamil`
- `PoultryBirdsMalayalam`

### SheepGoat
- `SheepGoat` (English)
- `SheepGoatHindi`
- `SheepGoatTamil`
- `SheepGoatMalayalam`

## Troubleshooting

### Backend Issues

1. **Port 5001 already in use:**
   ```bash
   # Find and kill the process
   lsof -ti:5001 | xargs kill -9
   ```

2. **MongoDB connection error:**
   - Check your internet connection
   - Verify MongoDB Atlas IP whitelist includes your IP
   - Check the connection string in `server.js`

3. **Module not found errors:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Frontend Issues

1. **Port 3000 already in use:**
   ```bash
   # Find and kill the process
   lsof -ti:3000 | xargs kill -9
   ```
   Or React will prompt you to use a different port.

2. **Cannot connect to backend:**
   - Make sure backend is running on port 5001
   - Check `frontend/src/components/Home.js` for API_BASE_URL
   - Verify CORS is enabled in backend

3. **Module not found errors:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Common Issues

1. **"Cannot find module" errors:**
   - Run `npm install` in both backend and frontend directories

2. **MongoDB connection timeout:**
   - Check your internet connection
   - Verify MongoDB Atlas cluster is running
   - Check firewall settings

3. **CORS errors:**
   - Backend already has CORS enabled
   - If issues persist, check `server.js` CORS configuration

## Development Tips

1. **Backend auto-reload:**
   - Use `npm run dev` (uses nodemon) for automatic server restart on file changes

2. **Frontend hot-reload:**
   - React automatically reloads when you save files

3. **View backend logs:**
   - Check the terminal where backend is running for API request logs

4. **View frontend errors:**
   - Check browser console (F12) for frontend errors
   - Check terminal for build errors

## Production Build

### Build Frontend for Production:
```bash
cd frontend
npm run build
```
This creates an optimized build in the `build` folder.

### Run Backend in Production:
```bash
cd backend
npm start
```

## Environment Variables (Optional)

If you want to use environment variables, create a `.env` file in the backend directory:

```env
PORT=5001
MONGO_URI=mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS
DATABASE_NAME=Diseases
```

Then update `server.js` to use `process.env.MONGO_URI` instead of the hardcoded string.

## Project Structure

```
veterinary-website/
├── backend/
│   ├── server.js          # Main backend server
│   ├── chatbot.js         # Chatbot service
│   ├── package.json       # Backend dependencies
│   └── node_modules/      # Backend packages
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
│   ├── package.json       # Frontend dependencies
│   └── public/            # Static files
└── start.sh               # Startup script
```

## Next Steps

1. ✅ Backend running on http://localhost:5001
2. ✅ Frontend running on http://localhost:3000
3. ✅ Test the search functionality
4. ✅ Try different language selections
5. ✅ Test the chatbot feature
6. ✅ Explore different disease categories

## Support

If you encounter any issues:
1. Check the terminal output for error messages
2. Check browser console (F12) for frontend errors
3. Verify MongoDB connection is working
4. Ensure all dependencies are installed

Happy coding! 🚀

