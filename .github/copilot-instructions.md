<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Smart Resume Screening System

This is a full-stack application for AI-powered resume screening with the following architecture:

## Frontend (Nuxt.js)
- **Pages**: index.vue (upload), screen.vue (processing), result.vue (results)
- **Components**: FileUploader.vue, JobInput.vue, ResultCard.vue
- **Store**: Pinia store for state management (resume.js)
- **Services**: API service for backend communication (api.js)

## Backend (Node.js/Express)
- **API Endpoints**: 
  - POST /api/upload-resume (file upload & text extraction)
  - POST /api/screen-resume (NLP processing)
  - GET /api/results/:id (fetch results)
- **NLP Integration**: Hugging Face models (BERT-NER, MiniLM)
- **Database**: MongoDB with Resume and ScreeningResult models
- **File Processing**: PDF and DOCX text extraction

## Key Technologies
- Frontend: Nuxt.js, Vue 3, Pinia, Tailwind-like CSS
- Backend: Express, MongoDB, Hugging Face Inference
- NLP Models: dslim/bert-base-NER, sentence-transformers/all-MiniLM-L6-v2

## Development Guidelines
- Use modern ES6+ syntax and async/await
- Follow Vue 3 Composition API patterns
- Implement proper error handling and loading states
- Use semantic HTML and responsive design
- Follow RESTful API conventions