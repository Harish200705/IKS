# Veterinary Disease Search Website

A vibrant, responsive veterinary website built with React frontend and Node.js/Express backend that allows users to search for animal diseases and view detailed treatment information.

## Features

### Frontend
- 🎨 **Vibrant & Modern UI** - Beautiful gradient backgrounds, hover animations, and modern design
- 🔍 **Dynamic Search** - Search by disease name or symptoms
- 🏷️ **Filter Options** - Filter results by disease name or symptoms
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🎯 **Interactive Cards** - Hover effects and smooth transitions
- 📄 **Detailed Disease Pages** - Complete treatment information
- ⚡ **Loading States** - Smooth loading indicators
- 🚨 **Error Handling** - User-friendly error messages

### Backend
- 🚀 **Express.js API** - RESTful endpoints for disease data
- 🗄️ **MongoDB Atlas** - Cloud database for disease information
- 🔍 **Search API** - Fuzzy search by disease name or symptoms
- 📊 **Disease Details** - Complete treatment information retrieval
- 🐄 **Cow & Buffalo Diseases** - 63 diseases from the cowAndBuffalo collection

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Modern CSS with gradients and animations

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

## Database Schema

The MongoDB collection `cowAndBuffalo` in the `Diseases` database contains the following fields:
- `Disease Name` - Name of the disease
- `Symptoms` - List of symptoms
- `Causes` - Causes of the disease
- `Treatment Name` - Name of the treatment
- `Ingredients` - Treatment ingredients
- `Preparation Method` - How to prepare the treatment
- `Dosage` - Dosage instructions

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

### Database Setup

1. The application uses MongoDB Atlas with the provided connection string
2. To populate the database with sample data, make a POST request to:
   ```
   POST http://localhost:5001/api/seed
   ```

## API Endpoints

### Search Diseases
```
GET /api/search?query=<search_term>
```
Returns diseases matching the search query in disease name or symptoms.

### Get Disease by ID
```
GET /api/disease/:id
```
Returns detailed information about a specific disease.

### Get All Diseases
```
GET /api/diseases
```
Returns all diseases with basic information (name, symptoms, id).

### Seed Database
```
POST /api/seed
```
Populates the database with sample veterinary disease data.

## Usage

1. **Search for Diseases**: Use the search bar to find diseases by name or symptoms
2. **Filter Results**: Use the filter buttons to narrow down results
3. **View Details**: Click on any disease card to see complete treatment information
4. **Navigate**: Use the back button to return to the search page

## Sample Diseases Included

The application now connects to the `cowAndBuffalo` collection containing 63 cow and buffalo diseases, including:

- Snoring or Coughing
- Fracture of Broken Leg
- Obstruction in Nasal Region
- Bleeding in Nose (Epistaxis)
- And 59 more diseases with complete treatment information

## Project Structure

```
veterinary-website/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Home.js
│   │   │   └── DiseaseDetail.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── public/
└── README.md
```

## Features in Detail

### Search Functionality
- Real-time search as you type
- Search across disease names and symptoms
- Case-insensitive search
- Instant results with loading states

### Responsive Design
- Mobile-first approach
- Flexible grid layout
- Touch-friendly interface
- Optimized for all screen sizes

### Modern UI/UX
- Gradient backgrounds and modern colors
- Smooth hover animations
- Card-based layout with shadows
- Professional typography

### Error Handling
- Network error handling
- User-friendly error messages
- Graceful fallbacks
- Loading states for better UX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
# IKS
