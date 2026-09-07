# Santhosh Kumar N — Personal Portfolio

A modern, cinematic personal portfolio website for **Santhosh Kumar N**, focused on software engineering, backend development, AI-powered applications, APIs, databases, testing, and cloud-ready engineering.

## ✨ Highlights

- Cinematic dark UI with a red-accent visual system
- Responsive desktop, tablet, and mobile layout
- Smooth scrolling and section navigation
- Custom cursor interactions on pointer-enabled devices
- Scroll progress indicator
- Quick-navigation dialog
- Interactive project architecture showcases
- Scroll-driven animated WebM background
- Reduced-motion support with `prefers-reduced-motion`
- SEO and social sharing metadata
- Direct GitHub, LinkedIn, email, and WhatsApp contact actions

## 🧰 Tech Stack

### Portfolio Website

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- HTML `<dialog>` API
- Responsive CSS / media queries
- Google Fonts — Inter

### Technologies Featured Across Projects

- **Backend:** Node.js, Express.js, Python, FastAPI, PHP
- **Frontend:** React, Vite, React Native, Tailwind CSS
- **Databases:** PostgreSQL, MongoDB, MySQL
- **Realtime:** Socket.io / Socket.IO
- **AI & Data:** OCR, NLP, RAG, embeddings, TensorFlow / Keras, scikit-learn, Power BI
- **DevOps:** Git, GitHub, Jenkins, Docker, Docker Compose, CI/CD

## 📌 Featured Projects

### CivicFix
**Crowdsourced Civic Issue Reporting Platform**

A civic issue reporting and tracking platform built around scalable REST APIs, role-based access, image verification, duplicate detection, and AI-assisted issue verification.

**Core technologies:** React Native, Expo, Node.js, Express.js, PostgreSQL, Sequelize, Python, TensorFlow / Keras.

- Citizen and officer workflows
- Authentication and authorization
- Geo-tagged complaint management
- Image upload and EXIF validation
- pHash-based duplicate detection
- AI verification with a custom CNN
- Officer / admin dashboard

Repository: https://github.com/santhoshkumar12133/CivicFix

### Medical Expense Processing
**AI-Powered Automated Medical Claim Pipeline**

A backend-oriented system that transforms uploaded medical documents into structured claim data through OCR and validation workflows.

**Core technologies:** FastAPI, REST APIs, OCR, pytesseract, Pillow, PostgreSQL, SQLAlchemy.

The architecture also documents a planned RAG policy-verification phase using PDF parsing, chunking, embeddings, ChromaDB, top-k retrieval, rule parsing, and explainable decisions.

Repository: https://github.com/santhosh12133/medical-claim-ai

### Learnato Discussion Forum
**Real-Time Discussion Forum Microservice for E-Learning**

A modular forum for learners and instructors to create posts, search and sort discussions, reply in real time, upvote content, and mark questions as answered.

**Core technologies:** React, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, Socket.io, Docker, Docker Compose.

Repository: https://github.com/santhosh12133/learnato-forum

### Task App
**AI-Powered Full-Stack Task Management Application**

A realtime task-management application with authentication, tasks, notes, dashboard modules, AI assistant endpoints, and user-scoped Socket.IO events.

**Core technologies:** React 19, Vite, Tailwind CSS, Node.js, Express 5, MongoDB, Mongoose, Socket.IO, JWT, Google Sign-In, Zod, Recharts, React Hook Form.

Repository: https://github.com/santhosh12133/task-app

### Telco Customer Churn Dashboard
**Telecom Churn Analysis with Python and Power BI**

An analytics and machine-learning project covering preprocessing, categorical encoding, SMOTE class balancing, Random Forest modeling, evaluation metrics, and an interactive Power BI dashboard.

**Core technologies:** Python, Pandas, NumPy, Matplotlib, Seaborn, scikit-learn, imbalanced-learn, Random Forest, Power BI.

Repository: https://github.com/santhosh12133/Telco-Customer-Churn-Dashboard

### E-Commerce Platform
**PHP-Based Customer and Admin Commerce System**

A full-stack e-commerce website with customer and admin modules for authentication, product browsing, cart management, product administration, image uploads, and session-based access control.

**Core technologies:** PHP, MySQL, HTML, CSS, JavaScript.

Repository: https://github.com/santhosh12133/e-commerce

## 👨‍💻 Experience

### Truyon Technologies — Software Developer Intern
**Jan 2026 – Mar 2026**

- Built backend services focused on reliable data throughput.
- Developed secure REST APIs for client-server communication.
- Designed relational database schemas with attention to data integrity and query efficiency.

**Technologies:** Node.js, Express.js, SQL, REST APIs, Git.

### Rats Technologies — Junior Web Developer Intern
**May 2024 – Jun 2024**

- Developed Python REST services for data-processing workflows.
- Maintained SQL data stores and worked on query optimization.
- Used Git and GitHub for source control and collaboration.

**Technologies:** Python, REST services, SQL, Git / GitHub, responsive UI.

## 🎓 Education

### Master of Computer Applications (MCA)
**Nitte Meenakshi Institute of Technology, Bengaluru**  
2024 – 2026

### Bachelor of Computer Applications (BCA)
**Sri Bhagavan Mahaveer Jain College, KGF**  
2022 – 2024

## 🧠 Skills

**Programming & Backend:** Python, JavaScript, Node.js, Express.js, FastAPI, PHP, REST APIs  
**Frontend:** HTML, CSS, JavaScript, React, React Native, Vite, Tailwind CSS  
**Databases:** MySQL, PostgreSQL, MongoDB  
**Testing:** Manual Testing, Functional Testing, Regression Testing, API Testing, UAT, STLC  
**DevOps & Delivery:** Git, GitHub, Jenkins, Docker, CI/CD  
**Engineering:** SDLC, Agile, Scrum, Debugging  
**AI & Intelligent Systems:** OCR, Document Processing, NLP, RAG Pipelines, AI Automation, Embeddings, ChromaDB

## 🔬 Research & Publications

- **“DT-MR-FALCON: Digital Twin-Assisted Mixed Reality Emergency Corridor Optimization for Intelligent Ambulance Navigation”** — IEEE ICECCC 2026
- **“Automated Urban Issue Management Using YOLOv8 and Dynamic Team Dispatch Optimization”** — IEEE ICISCN 2026 / IEEE Xplore

The portfolio presents reported project outcomes including **92% detection accuracy** and a **69% reduction in resolution time** for the urban issue-management research work.

## 📜 Certifications

- Oracle Certified Foundations Associate — Agentic AI
- SAP Certified — SAP Generative AI Developer
- Microsoft Azure Fundamentals (AZ-900) — Udemy
- Artificial Intelligence — Qualcomm

## 🎨 Portfolio Design & Interaction

The website is implemented without a frontend framework and uses browser-native APIs and static assets.

- CSS custom properties for the visual design system and motion timings
- `scroll-behavior: smooth`
- Pointer-aware custom cursor interactions
- Canvas-based background rendering
- Local WebM background animation
- Responsive and mobile-aware rendering
- Reduced-motion fallback
- Accessible labels for interactive controls
- Native `<dialog>` elements for quick navigation and architecture details

## 📁 Repository Structure

```text
Personal-portfolio/
├── .github/
├── .gitignore
├── index.html
├── style.css
├── background-animation.webm
├── 54ae41f975c65f1c4ec74a15f829a242.jpg
└── README.md
```

## 🚀 Run Locally

This is a static website and does not require package installation for the basic version.

Open `index.html` directly in a modern browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## 🌐 Deployment

As a static HTML/CSS/JavaScript site, the portfolio can be deployed to GitHub Pages, Vercel, Netlify, Cloudflare Pages, or another static web server.

The repository uses the `main` branch.

## 📬 Contact

**Santhosh Kumar N**  
Software Engineer · Backend & AI

- GitHub: https://github.com/santhosh12133
- LinkedIn: https://www.linkedin.com/in/santhosh-kumar-n-4b4b84310
- Email: santhoshkumar12133@gmail.com
- WhatsApp: https://wa.me/918495900723

## 📄 License

This repository is a personal portfolio project. Unless otherwise stated in individual assets or referenced projects, the source is maintained for portfolio and demonstration purposes.
