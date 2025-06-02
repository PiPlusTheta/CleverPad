# 📝 CleverPad

<div align="center">
  <img src="frontend/public/notebookpen.svg" alt="CleverPad Logo" width="120" height="120">
  
  **A modern, full-stack note-taking application with rich text editing capabilities**
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## ✨ Features

### 🎨 **Rich Text Editing**
- **TipTap Editor** with advanced formatting capabilities
- **Font customization** with multiple font families
- **Text alignment** (left, center, right, justify)
- **Image insertion** and management
- **Bold, italic, underline, strikethrough** formatting
- **Lists** (ordered and unordered)
- **Headings** (H1-H6)
- **Real-time preview** toggle

### 📄 **Export & Import**
- **PDF Export** with custom styling
- **Markdown Export** for cross-platform compatibility
- **JSON Export** for data backup
- **File Import** support for various formats

### 🔐 **Authentication & Security**
- **JWT-based authentication** with secure token management
- **User registration and login** system
- **Password hashing** using bcrypt
- **Protected routes** and user session management
- **Guest mode** for quick note-taking

### 🎯 **User Experience**
- **Responsive design** that works on all devices
- **Dark/Light/System theme** support
- **Real-time search** across all notes
- **Auto-save** functionality
- **Sidebar navigation** with note management
- **Statistics dashboard** showing note count and activity

### 🛠️ **Technical Excellence**
- **RESTful API** design with FastAPI
- **PostgreSQL database** with SQLAlchemy ORM
- **React** with modern hooks and functional components
- **Modular architecture** for easy maintenance and scaling

---

## 🚀 Quick Start

### Prerequisites

Before setting up CleverPad, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 12+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Download Git](https://git-scm.com/downloads)

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CleverPad.git
   cd CleverPad
   ```

2. **Set up the backend**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### 🗄️ Database Setup

1. **Create PostgreSQL database**
   ```sql
   -- Connect to PostgreSQL and run:
   CREATE DATABASE CleverPad;
   CREATE USER cleverpad_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE CleverPad TO cleverpad_user;
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql://cleverpad_user:your_password@localhost:5432/CleverPad
   SECRET_KEY=your-super-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

   > 🔐 **Security Note**: Generate a strong secret key using:
   > ```bash
   > python -c "import secrets; print(secrets.token_hex(32))"
   > ```

3. **Initialize database tables**
   ```bash
   cd backend
   python -m app.main
   # Tables will be created automatically on first run
   ```

### 🏃‍♂️ Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Backend will be available at: `http://localhost:8000`
   
   API Documentation: `http://localhost:8000/docs`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will be available at: `http://localhost:5173`

---

## 🏗️ Project Structure

```
CleverPad/
├── 📁 backend/                 # FastAPI backend
│   ├── 📁 app/
│   │   ├── 📁 core/           # Core configuration and security
│   │   │   ├── config.py      # Application configuration
│   │   │   └── security.py    # JWT and password hashing
│   │   ├── 📁 routes/         # API route handlers
│   │   │   ├── users.py       # Authentication endpoints
│   │   │   └── notes.py       # Notes CRUD endpoints
│   │   ├── models.py          # SQLAlchemy database models
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── crud.py            # Database operations
│   │   ├── dependencies.py    # Dependency injection
│   │   ├── database.py        # Database connection
│   │   └── main.py            # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── 📁 frontend/               # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   │   ├── RichTextEditor.jsx    # TipTap rich text editor
│   │   │   ├── Login.jsx             # Authentication forms
│   │   │   ├── NotesList.jsx         # Notes sidebar
│   │   │   └── ...
│   │   ├── NotesApp.jsx       # Main application component
│   │   └── App.jsx            # React app entry point
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # This file
```

---

## 🛠️ API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login with email/password |
| `GET` | `/auth/me` | Get current user profile |

### Notes Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes/` | Get all user notes |
| `POST` | `/notes/` | Create a new note |
| `PUT` | `/notes/{note_id}` | Update an existing note |
| `DELETE` | `/notes/{note_id}` | Delete a note |

### Example API Usage

```javascript
// Create a new note
const response = await fetch('http://localhost:8000/notes/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My New Note',
    content: '<p>Rich text content here...</p>'
  })
});
```

---

## 🎨 Tech Stack

### Backend Technologies
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for Python
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - SQL toolkit and ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Advanced open source database
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - Data validation using Python type hints
- **[python-jose](https://github.com/mpdavis/python-jose)** - JWT implementation
- **[Passlib](https://passlib.readthedocs.io/)** - Password hashing library

### Frontend Technologies
- **[React 19](https://reactjs.org/)** - Modern UI library
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TipTap](https://tiptap.dev/)** - Headless rich-text editor
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready motion library
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icon pack

---

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Set environment variables**
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   SECRET_KEY=your-production-secret-key
   ```

2. **Install production dependencies**
   ```bash
   pip install gunicorn
   ```

3. **Create Procfile**
   ```
   web: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow **PEP 8** for Python code
- Use **ESLint** configuration for JavaScript/React
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About the Developer

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/68808227?v=4" alt="Developer Photo" width="150" style="border-radius: 50%;">
  
  ### **Niloy Nath**
  
  *Full-Stack Developer & Software Engineer*
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PiPlusTheta)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/piplustheta)
  [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://skanniloynath.com)
  [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:niloy@skanniloynath.com)
</div>

### 🎯 About Me

I'm Niloy Nath, a passionate full-stack developer with expertise in modern web technologies. I love creating applications that solve real-world problems and provide exceptional user experiences. CleverPad represents my commitment to building tools that enhance productivity and creativity.

**Key Expertise:**
- **Frontend:** React, TypeScript, TailwindCSS, Vue.js
- **Backend:** Python, FastAPI, Node.js, Express
- **Database:** PostgreSQL, MongoDB, Redis
- **DevOps:** Docker, AWS, CI/CD, GitHub Actions
- **Tools:** Git, VSCode, Figma, Postman

### 💭 Philosophy

> "Clean code is not written by following a set of rules. You don't become a software craftsman by learning a list of heuristics. Professionalism and craftsmanship come from values that drive disciplines." - Robert C. Martin

I believe in writing code that is not just functional, but also maintainable, scalable, and beautiful. Every line of code in CleverPad has been crafted with care and attention to detail.

---

## 🙏 Acknowledgments

- **[FastAPI](https://fastapi.tiangolo.com/)** team for the incredible framework
- **[React](https://reactjs.org/)** team for the powerful UI library
- **[TipTap](https://tiptap.dev/)** for the amazing rich text editor
- **[TailwindCSS](https://tailwindcss.com/)** for the utility-first CSS framework
- All the open-source contributors who make projects like this possible

---

## 📞 Support

If you have any questions, issues, or suggestions, please feel free to:

- **Open an issue** on GitHub
- **Start a discussion** in the repository
- **Contact me directly** via email or social media

---

<div align="center">
  <p>Made with ❤️ and lots of ☕</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
