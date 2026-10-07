import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Database, 
  Layout, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Award,
  Copy,
  Check
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  keyHighlights: { title: string; desc: string }[];
  speakerNotes: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Contact Management System',
    subtitle: 'A Modern Web Application Built with Python Flask, SQLite3, and Bootstrap 5',
    bulletPoints: [
      'Comprehensive CRUD contact directory web application',
      'Engineered with lightweight, battery-included Python Flask backend',
      'Zero-configuration relational persistence via embedded SQLite3',
      'Responsive, mobile-friendly interface designed with Bootstrap 5 components',
      'Targeted for academic submission, semester project, and real-world utility'
    ],
    keyHighlights: [
      { title: 'Backend', desc: 'Python 3.x with Flask Framework & Jinja2 Templating' },
      { title: 'Database', desc: 'SQLite3 relational database (contacts.db)' },
      { title: 'Frontend', desc: 'Bootstrap 5.3, HTML5, CSS3, & Bootstrap Icons' }
    ],
    speakerNotes: 'Introduce yourself and your project title. Emphasize that the Contact Management System was engineered to offer reliable contact management with minimal overhead, using standard libraries for high portability.'
  },
  {
    id: 2,
    title: 'Problem Statement & Motivation',
    subtitle: 'Why Digital Contact Management is Critical for Personal & Academic Productivity',
    bulletPoints: [
      'Fragmented Information: Contact details often scatter across emails, spreadsheets, and chat groups',
      'Lack of Categorization: Difficulty filtering contacts across Family, Friends, College, and Work',
      'Complex Heavyweight Tools: Commercial CRM software is overly complex, resource-heavy, and paid',
      'Learning Objective: Understanding full-stack web development principles: routing, request handling, database queries, and template rendering'
    ],
    keyHighlights: [
      { title: 'Problem', desc: 'Scattered, unorganized contact details without category indexing' },
      { title: 'Solution', desc: 'Centralized, lightweight web system with real-time multi-field search' },
      { title: 'Target Audience', desc: 'Students, professionals, and small organizations' }
    ],
    speakerNotes: 'Explain the user pain point. Traditional notebooks or disjointed spreadsheets cause data loss and lack instant search. This project provides a centralized, instant-access web portal.'
  },
  {
    id: 3,
    title: 'System Architecture (MVC Pattern)',
    subtitle: 'Model-View-Controller Organization in Python Flask',
    bulletPoints: [
      'Model: SQLite contacts table managed via Python sqlite3 connector with sqlite3.Row mapping',
      'View: Jinja2 HTML templates (base.html, index.html, contacts.html, etc.) rendering server data',
      'Controller: Flask route decorators (@app.route) handling HTTP GET and POST requests',
      'Separation of Concerns: Business logic in app.py, presentation in templates/, assets in static/'
    ],
    keyHighlights: [
      { title: 'Client Browser', desc: 'Sends HTTP requests (GET/POST), renders HTML5/Bootstrap 5' },
      { title: 'Flask Controller', desc: 'Processes parameters, validates inputs, executes SQL queries' },
      { title: 'SQLite Database', desc: 'Stores persistent records with transactional integrity' }
    ],
    speakerNotes: 'Walk through how the MVC paradigm is satisfied. The Model is SQLite, the View is Jinja2 templates extending base.html, and the Controller is Flask app.py dispatching routes.'
  },
  {
    id: 4,
    title: 'Database Schema & Design',
    subtitle: 'Relational SQLite3 Table Structure (`contacts.db`)',
    bulletPoints: [
      'Table Name: `contacts` with auto-incrementing primary key',
      '`id`: INTEGER PRIMARY KEY AUTOINCREMENT — Unique identifier for each contact',
      '`full_name`: TEXT NOT NULL — Contact name with mandatory validation',
      '`phone`: TEXT NOT NULL — Primary telephone/mobile number',
      '`email`: TEXT — Email address with pattern validation',
      '`address` & `city`: TEXT — Geographic and residential details',
      '`category`: TEXT NOT NULL DEFAULT \'Other\' — Family, Friends, College, Work, Other',
      '`notes`: TEXT — Free-form description and context',
      '`created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP — Automated audit timestamp'
    ],
    keyHighlights: [
      { title: 'Normalization', desc: 'Atomic fields, clear constraints, zero external database setup' },
      { title: 'Data Integrity', desc: 'NOT NULL constraints on essential fields (Name, Phone)' },
      { title: 'Row Factory', desc: 'sqlite3.Row provides dictionary-style column access' }
    ],
    speakerNotes: 'Detail the schema. Emphasize why SQLite was selected: it requires no standalone server daemon like MySQL or PostgreSQL, eliminating installation friction for examiners and users.'
  },
  {
    id: 5,
    title: 'Key Modules & Functional Specifications',
    subtitle: 'Full Lifecycle CRUD Operations with Interactive Feedback',
    bulletPoints: [
      '1. Dashboard Module: Summary metric cards, category distribution, recently added list',
      '2. Contact Creation (C): Form with input verification, flash success notification',
      '3. Directory & Search (R): Multi-field live query across name, phone, email, city, category',
      '4. Contact Update (U): Pre-populated edit form to safely modify existing rows',
      '5. Contact Deletion (D): Two-step verification modal to prevent accidental data loss',
      '6. Detailed Profile: Dedicated view page with click-to-call and mailto protocol triggers'
    ],
    keyHighlights: [
      { title: 'Create', desc: 'POST /add with field sanitation and error flashes' },
      { title: 'Read', desc: 'GET /contacts with sorting & category query parameters' },
      { title: 'Update & Delete', desc: 'POST /edit/<id> & POST /delete/<id> with modal confirmations' }
    ],
    speakerNotes: 'Highlight the 5 core modules. Mention the flash messaging mechanism that alerts users upon successful insertion, modification, or removal of records.'
  },
  {
    id: 6,
    title: 'Technology Stack & Justification',
    subtitle: 'Why Python Flask, SQLite, and Bootstrap 5 Were Chosen',
    bulletPoints: [
      'Python 3: Clean syntax, robust standard library, excellent academic reputation',
      'Flask Microframework: Minimalist, unopinionated, avoids boilerplate of Django',
      'Jinja2 Templating: Modular template inheritance via {% extends "base.html" %}',
      'SQLite3: Zero-configuration, serverless, self-contained relational database file',
      'Bootstrap 5.3: Modern responsive grid, utility classes, and accessible UI widgets',
      'Bootstrap Icons: Lightweight SVG iconography without heavy font downloads'
    ],
    keyHighlights: [
      { title: 'Simplicity', desc: 'Easy to comprehend and explain in technical evaluation sessions' },
      { title: 'Zero Cost', desc: '100% open-source software with zero paid licensing' },
      { title: 'Portability', desc: 'Entire project runs on Windows, macOS, and Linux' }
    ],
    speakerNotes: 'Contrast Flask with Django. Explain that Flask provides full transparency of code flow for beginners without overwhelming boilerplate, making it optimal for coursework defense.'
  },
  {
    id: 7,
    title: 'Form Validation & Defensive Programming',
    subtitle: 'Ensuring Data Consistency and System Stability',
    bulletPoints: [
      'Client-Side Validation: HTML5 required attributes and Bootstrap .was-validated feedback',
      'Server-Side Validation: Python string stripping and mandatory field checks in app.py',
      'SQL Injection Prevention: Parameterized queries with `?` placeholders throughout all SQL statements',
      'Flash Messaging: Category-aware alerts (success, danger, warning, info) with dismiss buttons',
      'Error Handling: Graceful redirection when querying non-existent contact IDs'
    ],
    keyHighlights: [
      { title: 'Security', desc: 'Zero string concatenation in SQL queries ensures injection defense' },
      { title: 'Validation', desc: 'Dual-layer checks (browser + server) guarantee clean database records' },
      { title: 'Session Safety', desc: 'Cryptographic secret_key secures flash alerts and sessions' }
    ],
    speakerNotes: 'This slide demonstrates engineering rigor. Point out that all SQL commands use parametrized queries with `?` to avoid SQL injection attacks.'
  },
  {
    id: 8,
    title: 'UI/UX & Mobile Responsiveness',
    subtitle: 'Human-Centered Design for Frictionless Operation',
    bulletPoints: [
      'Responsive Grid: Fluid layout adapting seamlessly across mobile, tablet, and desktop viewports',
      'Visual Category Badges: Distinctive color-coded badges for Family, Friends, College, Work, Other',
      'Quick-Action Protocols: Click-to-call (tel:), SMS triggers, and compose email (mailto:)',
      'Modal Confirmations: Non-destructive modal dialogs preventing accidental deletions',
      'Visual Feedback: Dynamic empty states with intuitive call-to-action buttons'
    ],
    keyHighlights: [
      { title: 'Mobile First', desc: 'Collapsible navbar and responsive table scrolling' },
      { title: 'Clarity', desc: 'High-contrast typography with clean Inter font family' },
      { title: 'Accessibility', desc: 'Semantic HTML5 tags and ARIA labels on interactive elements' }
    ],
    speakerNotes: 'Demonstrate responsiveness. On mobile screens, tables scroll smoothly horizontally and cards stack cleanly, allowing mobile phone users to dial directly from the page.'
  },
  {
    id: 9,
    title: 'Limitations & Future Scope',
    subtitle: 'Roadmap for Production Scaling and Advanced Capabilities',
    bulletPoints: [
      'User Authentication: Integrating Multi-User RBAC with Flask-Login and password hashing (bcrypt)',
      'Contact Photo Uploads: Secure image storage for avatar profile pictures',
      'vCard / Google Contacts Sync: Two-way synchronization with mobile devices and Google Contacts API',
      'Cloud Deployment: Containerization with Docker and deployment to AWS / Google Cloud Run',
      'REST API Layer: Exposing JSON endpoints with JWT authentication for mobile iOS/Android apps',
      'Duplicate Detection: Smart algorithm identifying potential duplicate phone numbers or emails'
    ],
    keyHighlights: [
      { title: 'Phase 2', desc: 'Multi-user authentication & user profile pictures' },
      { title: 'Phase 3', desc: 'REST API & Google Contacts cloud synchronization' },
      { title: 'Phase 4', desc: 'Docker containerization & CI/CD deployment' }
    ],
    speakerNotes: 'Examiners appreciate candidates who understand current system constraints. Present these future enhancements proactively to show critical thinking.'
  },
  {
    id: 10,
    title: 'Conclusion & Summary',
    subtitle: 'Project Milestone Achievements and Deliverables',
    bulletPoints: [
      'Delivered a complete, working Contact Management System web application',
      'Successfully fulfilled all functional objectives: Dashboard, Add, View, Search, Edit, Delete',
      'Implemented clean, beginner-friendly architecture following Python Flask standards',
      'Zero-dependency database via SQLite3 ensures effortless evaluation and execution',
      'Ready for academic review, project presentation, and real-world deployment'
    ],
    keyHighlights: [
      { title: 'Outcome', desc: 'Fully functional, production-ready beginner web application' },
      { title: 'Deliverables', desc: 'Source code, database, presentation slides, & project guide' },
      { title: 'Status', desc: 'Completed & Verified successfully' }
    ],
    speakerNotes: 'Conclude with confidence. Summarize that the project meets all functional requirements cleanly, and invite questions from the panel.'
  }
];

export const PresentationSlides: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);

  const slide = SLIDES[currentSlideIndex];

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const copySlideText = () => {
    const text = `Slide ${slide.id}: ${slide.title}\n${slide.subtitle}\n\nKey Points:\n${slide.bulletPoints.map(p => `• ${p}`).join('\n')}\n\nSpeaker Notes:\n${slide.speakerNotes}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
              Academic Project & PPT Deck
            </span>
            <span className="text-xs text-slate-400">10 Structured Slides</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Presentation Slides (PPT)</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Use these interactive presentation cards for your project review, seminar, or system demonstration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showNotes ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {showNotes ? 'Hide Speaker Notes' : 'Show Speaker Notes'}
          </button>
          <button
            onClick={copySlideText}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Slide'}</span>
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
        {/* Slide Counter & Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500 text-white">
                Slide {slide.id} of {SLIDES.length}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">Contact Management System</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Department of Computer Science &bull; 2026
            </div>
          </div>

          {/* Slide Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-blue-200 font-medium mt-1">
              {slide.subtitle}
            </p>
          </div>

          {/* Bullet points */}
          <div className="mt-6 space-y-2.5">
            {slide.bulletPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            {slide.keyHighlights.map((hl, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold uppercase text-blue-300 tracking-wider">
                  {hl.title}
                </div>
                <div className="text-xs text-slate-200 mt-1 leading-snug">
                  {hl.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Slide Navigation Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-700 px-2">
            Slide {currentSlideIndex + 1} / {SLIDES.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentSlideIndex === SLIDES.length - 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide quick picker */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                currentSlideIndex === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Speaker Notes */}
      {showNotes && (
        <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Recommended Presentation Speech / Speaker Notes for Slide {slide.id}:</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed italic">
            "{slide.speakerNotes}"
          </p>
        </div>
      )}
    </div>
  );
};
