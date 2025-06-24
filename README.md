# 🎯 Smart Resume Screening System

An AI-powered resume screening application that analyzes resumes against job descriptions using advanced NLP models. Built with Nuxt.js frontend and Node.js/Express backend.

## ✨ Features

- **Smart File Upload**: Drag-and-drop PDF/DOCX resume upload with validation
- **AI-Powered Analysis**: Uses Hugging Face BERT models for entity extraction and semantic similarity
- **Match Scoring**: Provides percentage match scores between resumes and job descriptions
- **Keyword Analysis**: Identifies matched and missing skills/keywords
- **Personalized Recommendations**: AI-generated suggestions for resume improvement
- **Export Results**: Download screening results in JSON and text formats
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Frontend (Nuxt.js)
- **Pages**: Upload (`index.vue`), Processing (`screen.vue`), Results (`result.vue`)
- **Components**: `FileUploader`, `JobInput`, `ResultCard`
- **State Management**: Pinia store for resume data and screening results
- **Styling**: Custom CSS with modern design patterns

### Backend (Node.js/Express)
- **API Endpoints**:
  - `POST /api/upload-resume` - File upload and text extraction
  - `POST /api/screen-resume` - AI-powered resume screening
  - `GET /api/results/:id` - Retrieve screening results
- **NLP Models**: 
  - `dslim/bert-base-NER` for entity extraction
  - `sentence-transformers/all-MiniLM-L6-v2` for semantic similarity
- **Database**: MongoDB for storing resumes and results
- **File Processing**: PDF and DOCX text extraction

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud instance)
- Hugging Face API token (optional, for enhanced NLP features)

### Installation

1. **Clone and setup the project**:
   ```bash
   cd "CV Screen application"
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Environment** (`.env` file in `/backend`):
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/resume-screening
   HUGGINGFACE_API_TOKEN=your_token_here
   ```

2. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

### Running the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🔧 Usage

1. **Upload Resume**: Drag and drop or select a PDF/DOCX file
2. **Add Job Description**: Paste the job description text
3. **Start Screening**: Click to begin AI analysis
4. **View Results**: Get match scores, keyword analysis, and recommendations
5. **Export Results**: Download results for future reference

## 🤖 AI Models

- **Entity Extraction**: `dslim/bert-base-NER` identifies companies, locations, and other entities
- **Semantic Similarity**: `sentence-transformers/all-MiniLM-L6-v2` calculates resume-job match scores
- **Keyword Matching**: Custom algorithm for technical skill identification
- **Recommendation Engine**: AI-generated improvement suggestions

## 📂 Project Structure

```
├── backend/
│   ├── server.js              # Express server
│   ├── models/                # MongoDB schemas
│   ├── services/              # NLP processing
│   └── utils/                 # File processing utilities
├── frontend/
│   ├── pages/                 # Nuxt.js pages
│   ├── components/            # Vue components
│   ├── store/                 # Pinia state management
│   └── services/              # API communication
└── .github/
    └── copilot-instructions.md
```

## 🛠️ Development

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend Scripts
- `npm run dev` - Start Nuxt.js development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔒 Security Features

- File type validation (PDF/DOCX only)
- File size limits (5MB max)
- Input sanitization
- Error handling and validation
- CORS configuration

## 🎨 UI/UX Features

- Modern, clean interface
- Drag-and-drop file upload
- Real-time progress indicators
- Responsive design
- Loading states and animations
- Error handling with user feedback

## 📊 API Documentation

### Upload Resume
```http
POST /api/upload-resume
Content-Type: multipart/form-data

Response: {
  "resumeId": "string",
  "text": "string",
  "message": "string"
}
```

### Screen Resume
```http
POST /api/screen-resume
Content-Type: application/json

Body: {
  "resumeId": "string",
  "jobDescription": "string"
}

Response: {
  "resultId": "string",
  "matchScore": number,
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "recommendations": ["string"]
}
```

## 🚀 Production Deployment

1. Set up MongoDB Atlas or equivalent
2. Configure environment variables
3. Build frontend: `npm run build`
4. Deploy backend to your preferred hosting service
5. Deploy frontend to Vercel, Netlify, or similar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Hugging Face for NLP models
- Vue.js and Nuxt.js communities
- MongoDB for database solutions
- Express.js framework

---

Built with ❤️ using modern web technologies and AI