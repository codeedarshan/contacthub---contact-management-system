# Contact Management System (Python Flask + SQLite)

A clean, beginner-friendly web application developed with **Python Flask**, **SQLite3**, and **Bootstrap 5**.

---

## 📁 Project Structure

```text
contact_management/
│
├── app.py                 # Main Flask application with routes and SQLite queries
├── contacts.db            # SQLite database file containing contacts table
├── init_db.py             # Standalone database initialization and seed script
├── requirements.txt       # Python package dependencies (Flask, Werkzeug)
│
├── templates/             # Jinja2 HTML templates
│   ├── base.html          # Base layout with navbar, footer, and flash messages
│   ├── index.html         # Dashboard with counts, category cards & recent list
│   ├── contacts.html      # All contacts table, search bar & category filters
│   ├── add_contact.html   # Form to create new contact with validation
│   ├── edit_contact.html  # Pre-populated form to edit existing contact
│   └── view_contact.html  # Detailed single-contact profile view
│
└── static/                # Static assets
    ├── css/
    │   └── style.css      # Custom styling, gradients, badges and avatars
    └── js/
        └── script.js      # Modal triggers, auto-closing alerts, client validation
```

---

## 🚀 Quick Setup & Run Instructions

### Step 1: Clone or Navigate to the Directory
```bash
cd contact_management
```

### Step 2: (Optional but Recommended) Create a Virtual Environment
```bash
# On Linux/macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Initialize the SQLite Database
```bash
python init_db.py
```
*(Note: If you skip this, `app.py` will also automatically initialize `contacts.db` on first launch!)*

### Step 5: Start the Flask Application
```bash
python app.py
```

### Step 6: Open in Your Browser
Open your browser and navigate to:
```text
http://127.0.0.1:5000/
```

---

## 🗄️ Database Schema

Table Name: `contacts` in `contacts.db`:

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| `full_name` | TEXT | NOT NULL | Contact's full name |
| `phone` | TEXT | NOT NULL | Primary telephone/mobile number |
| `email` | TEXT | NULLABLE | Email address |
| `address` | TEXT | NULLABLE | Physical or street address |
| `city` | TEXT | NULLABLE | City / Town |
| `category` | TEXT | NOT NULL DEFAULT 'Other' | Family, Friends, College, Work, Other |
| `notes` | TEXT | NULLABLE | Notes or remarks |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
