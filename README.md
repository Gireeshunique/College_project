# College_project

📘 AI PDF Voice Reader & Virtual Teacher

An AI-powered web application that allows users to upload PDF / DOCX / PPT files, view them in the browser, and have an AI voice assistant read the document aloud with controls like Start, Pause, Resume, and Stop.

This project is designed to act as a virtual teacher, helping students learn by listening to documents while viewing them simultaneously.

🚀 Features

📄 Upload PDF / DOCX / PPTX files

🔄 Automatic conversion to PDF (DOCX / PPTX)

👀 View PDF directly in the browser

🧠 Extract text from PDF page-wise

🔊 AI reads the document using browser Speech Synthesis

⏯ Start / Pause / Resume / Stop voice reading

🎙 Male / Female voice selection

⚡ Fast backend with Flask

🌐 React-based frontend

🗄 MySQL database for storing document text

🏗 Project Architecture
Frontend (React)
│
├── PDFViewer
│   ├── Upload file
│   ├── Render PDF
│   └── Extract text → App state
│
├── AIVoiceAssistant
│   └── Reads PDF text using AI voice
│
└── App.jsx (Shared State)
    └── pdfText
        ↓
Backend (Flask)
│
├── Upload API
├── File Converter (DOCX / PPTX → PDF)
├── PDF Text Extractor
├── Database Layer (MySQL)
└── AI Engine

🧑‍💻 Tech Stack
Frontend

React

PDF.js

Web Speech API (SpeechSynthesis)

CSS

Backend

Python (Flask)

Flask-CORS

pdfplumber

docx2pdf

python-pptx

MySQL Connector

Database

MySQL

📂 Project Structure
project-root/
│
├── backend/
│   ├── app.py
│   ├── ai_engine.py
│   ├── database.py
│   ├── pdf_utils.py
│   ├── file_converter.py
│   ├── uploads/
│   └── static/audio/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PDFViewer.jsx
│   │   │   └── AIVoiceAssistant.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   └── public/
│
└── README.md

🛠 Setup Instructions
1️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt


Create MySQL database:

CREATE DATABASE ai_teacher;

CREATE TABLE pdf_knowledge (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pdf_name VARCHAR(255),
  content LONGTEXT
);


Run backend:

python app.py


Backend runs at:

http://127.0.0.1:5000

2️⃣ Frontend Setup
cd frontend
npm install
npm start


Frontend runs at:

http://localhost:3000

🔌 API Endpoints
Method	Endpoint	Description
POST	/upload	Upload PDF / DOCX / PPT
GET	/pdf/<filename>	Serve PDF file
GET	/pdf_text_pages	Get extracted text
GET	/explain_pdf	AI summary (optional)
🎯 How It Works

User uploads a document

Backend converts it to PDF if required

PDF is rendered on frontend

Text is extracted and stored

Text is passed to AI Voice Assistant

AI reads the document aloud

User controls reading using buttons

✅ Current Capabilities

✔ AI reads full PDF content

✔ Smooth pause and resume

✔ No unnecessary popups

✔ Clean UI and UX

✔ Stable backend

🔮 Future Enhancements

🟨 Word highlighting inside PDF

📄 Page-by-page auto reading

🧠 Question answering from PDF

🎧 Google Neural TTS

🌍 Multi-language support

📱 Mobile-friendly UI

👨‍🎓 Use Cases

Students and self-learners

Visually impaired users

Online education platforms

Digital reading assistants

AI-based teaching tools

🧾 License

This project is for educational and research purposes.

🙌 Author

Gireesh Boggala
AI Virtual Teacher Project
