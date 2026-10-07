export interface ProjectFile {
  name: string;
  path: string;
  language: 'python' | 'html' | 'css' | 'javascript' | 'plaintext' | 'markdown';
  description: string;
  content: string;
}

export const FLASK_PROJECT_FILES: ProjectFile[] = [
  {
    name: 'app.py',
    path: 'contact_management/app.py',
    language: 'python',
    description: 'Main Flask backend application containing routes, SQLite queries, CRUD operations and search logic',
    content: `"""
Contact Management System
Backend: Python Flask + SQLite
A complete beginner-friendly web application for managing personal & professional contacts.
"""

from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
import os

# Initialize Flask Application
app = Flask(__name__)
# Secret key for session management and flash messages
app.secret_key = 'super_secret_contact_manager_key_change_in_production'

# Database Configuration
DATABASE_NAME = 'contacts.db'
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), DATABASE_NAME)

def get_db_connection():
    """
    Establish a connection to the SQLite database.
    Configures row_factory to sqlite3.Row to access columns by name (like dictionaries).
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Creates the contacts table if it does not already exist,
    and seeds sample contacts if the table is empty.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            address TEXT,
            city TEXT,
            category TEXT NOT NULL DEFAULT 'Other',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check if there are any existing contacts
    cursor.execute('SELECT COUNT(*) as count FROM contacts')
    count = cursor.fetchone()['count']
    
    if count == 0:
        sample_contacts = [
            ('Alex Morgan', '+1 (555) 234-5678', 'alex.morgan@workcorp.com', '742 Evergreen Terrace', 'Springfield', 'Work', 'Lead Software Engineer. Reach out regarding project deliverables.'),
            ('Sarah Connor', '+1 (555) 987-6543', 'sarah.c@familydomain.net', '124 Conch Street', 'San Francisco', 'Family', 'Cousin Sarah - birthday is on November 15th.'),
            ('David Miller', '+1 (555) 345-6789', 'dmiller@university.edu', '456 College Ave, Apt 3B', 'Boston', 'College', 'Lab partner for Advanced Data Structures coursework.'),
            ('Emma Watson', '+1 (555) 876-5432', 'emma.watson@creativemail.org', '10 Downing Street', 'London', 'Friends', 'Met at tech conference. Passionate about UI/UX design.'),
            ('Michael Chang', '+1 (555) 432-1098', 'michael.chang@techstart.io', '88 Silicon Parkway', 'San Jose', 'Work', 'Product Manager at TechStart. Discuss Q4 roadmap.')
        ]
        
        cursor.executemany('''
            INSERT INTO contacts (full_name, phone, email, address, city, category, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_contacts)
        conn.commit()
        print("Database initialized with sample contacts!")
    
    conn.close()

# -------------------------------------------------------------
# APPLICATION ROUTES
# -------------------------------------------------------------

@app.route('/')
def index():
    """
    Dashboard Route:
    - Calculates total contacts and category breakdown
    - Fetches the 5 most recently added contacts
    """
    conn = get_db_connection()
    
    # Total contacts count
    total_contacts = conn.execute('SELECT COUNT(*) as count FROM contacts').fetchone()['count']
    
    # Counts by category
    categories = ['Family', 'Friends', 'College', 'Work', 'Other']
    category_counts = {}
    for cat in categories:
        cnt = conn.execute('SELECT COUNT(*) as count FROM contacts WHERE category = ?', (cat,)).fetchone()['count']
        category_counts[cat] = cnt
        
    # 5 Most recently added contacts
    recent_contacts = conn.execute(
        'SELECT * FROM contacts ORDER BY id DESC LIMIT 5'
    ).fetchall()
    
    conn.close()
    
    return render_template(
        'index.html',
        total_contacts=total_contacts,
        category_counts=category_counts,
        recent_contacts=recent_contacts
    )

@app.route('/contacts')
def contacts():
    """
    View All Contacts Route:
    - Supports sorting by: name (asc/desc), date (newest/oldest)
    - Supports category filtering
    """
    category_filter = request.args.get('category', '').strip()
    sort_by = request.args.get('sort', 'date_desc').strip()
    
    conn = get_db_connection()
    
    query = 'SELECT * FROM contacts'
    params = []
    
    if category_filter and category_filter != 'All':
        query += ' WHERE category = ?'
        params.append(category_filter)
        
    # Determine sorting order
    if sort_by == 'name_asc':
        query += ' ORDER BY full_name ASC'
    elif sort_by == 'name_desc':
        query += ' ORDER BY full_name DESC'
    elif sort_by == 'date_asc':
        query += ' ORDER BY id ASC'
    else:  # default 'date_desc'
        query += ' ORDER BY id DESC'
        
    all_contacts = conn.execute(query, params).fetchall()
    total_count = conn.execute('SELECT COUNT(*) as count FROM contacts').fetchone()['count']
    conn.close()
    
    return render_template(
        'contacts.html',
        contacts=all_contacts,
        selected_category=category_filter or 'All',
        selected_sort=sort_by,
        total_count=total_count
    )

@app.route('/add', methods=['GET', 'POST'])
def add_contact():
    """
    Add Contact Route:
    - GET: Renders the blank form
    - POST: Validates input, inserts into database, and flashes status message
    """
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        phone = request.form.get('phone', '').strip()
        email = request.form.get('email', '').strip()
        address = request.form.get('address', '').strip()
        city = request.form.get('city', '').strip()
        category = request.form.get('category', 'Other').strip()
        notes = request.form.get('notes', '').strip()
        
        # Validation
        if not full_name:
            flash('Full Name is required!', 'danger')
            return render_template('add_contact.html', form_data=request.form)
            
        if not phone:
            flash('Phone number is required!', 'danger')
            return render_template('add_contact.html', form_data=request.form)
            
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO contacts (full_name, phone, email, address, city, category, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (full_name, phone, email, address, city, category, notes))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()
            flash(f'Contact "{full_name}" was successfully added!', 'success')
            return redirect(url_for('view_contact', id=new_id))
        except Exception as e:
            conn.close()
            flash(f'An error occurred while saving: {str(e)}', 'danger')
            return render_template('add_contact.html', form_data=request.form)
            
    return render_template('add_contact.html', form_data={})

@app.route('/view/<int:id>')
def view_contact(id):
    """
    Contact Details Route:
    - Displays complete information for the selected contact
    """
    conn = get_db_connection()
    contact = conn.execute('SELECT * FROM contacts WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    if contact is None:
        flash('Contact not found!', 'warning')
        return redirect(url_for('contacts'))
        
    return render_template('view_contact.html', contact=contact)

@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit_contact(id):
    """
    Edit Contact Route:
    - GET: Fetches current contact and renders pre-filled form
    - POST: Updates contact details in SQLite and flashes success message
    """
    conn = get_db_connection()
    contact = conn.execute('SELECT * FROM contacts WHERE id = ?', (id,)).fetchone()
    
    if contact is None:
        conn.close()
        flash('Contact not found!', 'warning')
        return redirect(url_for('contacts'))
        
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        phone = request.form.get('phone', '').strip()
        email = request.form.get('email', '').strip()
        address = request.form.get('address', '').strip()
        city = request.form.get('city', '').strip()
        category = request.form.get('category', 'Other').strip()
        notes = request.form.get('notes', '').strip()
        
        # Validation
        if not full_name:
            flash('Full Name is required!', 'danger')
            return render_template('edit_contact.html', contact=contact)
            
        if not phone:
            flash('Phone number is required!', 'danger')
            return render_template('edit_contact.html', contact=contact)
            
        try:
            conn.execute('''
                UPDATE contacts
                SET full_name = ?, phone = ?, email = ?, address = ?, city = ?, category = ?, notes = ?
                WHERE id = ?
            ''', (full_name, phone, email, address, city, category, notes, id))
            conn.commit()
            conn.close()
            flash(f'Contact "{full_name}" was successfully updated!', 'success')
            return redirect(url_for('view_contact', id=id))
        except Exception as e:
            conn.close()
            flash(f'Update failed: {str(e)}', 'danger')
            return render_template('edit_contact.html', contact=contact)
            
    conn.close()
    return render_template('edit_contact.html', contact=contact)

@app.route('/delete/<int:id>', methods=['POST', 'GET'])
def delete_contact(id):
    """
    Delete Contact Route:
    - Deletes contact by ID from SQLite database
    - Returns to contacts list with success notification
    """
    conn = get_db_connection()
    contact = conn.execute('SELECT full_name FROM contacts WHERE id = ?', (id,)).fetchone()
    
    if contact:
        contact_name = contact['full_name']
        conn.execute('DELETE FROM contacts WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        flash(f'Contact "{contact_name}" has been permanently deleted.', 'info')
    else:
        conn.close()
        flash('Contact not found.', 'warning')
        
    return redirect(url_for('contacts'))

@app.route('/search')
def search():
    """
    Search Route:
    - Searches contacts across Name, Phone, Email, City, Category, and Notes
    - Allows filtering by Category simultaneously
    """
    search_query = request.args.get('q', '').strip()
    category_filter = request.args.get('category', '').strip()
    
    conn = get_db_connection()
    
    sql = '''
        SELECT * FROM contacts
        WHERE (
            full_name LIKE ? OR 
            phone LIKE ? OR 
            email LIKE ? OR 
            city LIKE ? OR 
            category LIKE ? OR 
            notes LIKE ?
        )
    '''
    like_param = f'%{search_query}%'
    params = [like_param, like_param, like_param, like_param, like_param, like_param]
    
    if category_filter and category_filter != 'All':
        sql += ' AND category = ?'
        params.append(category_filter)
        
    sql += ' ORDER BY full_name ASC'
    
    results = conn.execute(sql, params).fetchall()
    conn.close()
    
    return render_template(
        'contacts.html',
        contacts=results,
        search_query=search_query,
        selected_category=category_filter or 'All',
        is_search_result=True
    )

# -------------------------------------------------------------
# APPLICATION ENTRYPOINT
# -------------------------------------------------------------
if __name__ == '__main__':
    # Initialize DB on first run
    init_db()
    print("=" * 60)
    print(" Contact Management System - Running at http://127.0.0.1:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
`
  },
  {
    name: 'init_db.py',
    path: 'contact_management/init_db.py',
    language: 'python',
    description: 'Standalone database initialization script that creates the contacts table and populates starter records',
    content: `"""
Database Initializer Script for Contact Management System
Run this script directly to create contacts.db and load seed data:
    python init_db.py
"""

import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'contacts.db')

def init_database():
    print(f"Connecting to database at: {DB_FILE}")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 1. Create contacts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            address TEXT,
            city TEXT,
            category TEXT NOT NULL DEFAULT 'Other',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("Table 'contacts' created successfully.")
    
    # 2. Check if table is empty and insert initial seed contacts
    cursor.execute("SELECT COUNT(*) FROM contacts")
    count = cursor.fetchone()[0]
    
    if count == 0:
        seed_data = [
            ('Alex Morgan', '+1 (555) 234-5678', 'alex.morgan@workcorp.com', '742 Evergreen Terrace', 'Springfield', 'Work', 'Lead Software Engineer. Reach out regarding project deliverables.'),
            ('Sarah Connor', '+1 (555) 987-6543', 'sarah.c@familydomain.net', '124 Conch Street', 'San Francisco', 'Family', 'Cousin Sarah - birthday is on November 15th.'),
            ('David Miller', '+1 (555) 345-6789', 'dmiller@university.edu', '456 College Ave, Apt 3B', 'Boston', 'College', 'Lab partner for Advanced Data Structures coursework.'),
            ('Emma Watson', '+1 (555) 876-5432', 'emma.watson@creativemail.org', '10 Downing Street', 'London', 'Friends', 'Met at tech conference. Passionate about UI/UX design.'),
            ('Michael Chang', '+1 (555) 432-1098', 'michael.chang@techstart.io', '88 Silicon Parkway', 'San Jose', 'Work', 'Product Manager at TechStart. Discuss Q4 roadmap.')
        ]
        
        cursor.executemany('''
            INSERT INTO contacts (full_name, phone, email, address, city, category, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', seed_data)
        conn.commit()
        print(f"Seeded {len(seed_data)} initial contacts into contacts.db successfully.")
    else:
        print(f"Database already contains {count} contacts. Skipping seeding.")
        
    conn.close()
    print("Database setup complete!")

if __name__ == '__main__':
    init_database()
`
  },
  {
    name: 'requirements.txt',
    path: 'contact_management/requirements.txt',
    language: 'plaintext',
    description: 'Python pip dependencies file specifying required versions',
    content: `Flask==3.0.3
Werkzeug==3.0.3
`
  },
  {
    name: 'templates/base.html',
    path: 'contact_management/templates/base.html',
    language: 'html',
    description: 'Base Jinja2 template containing common layout, Bootstrap 5 navbar, flash messages, and footer',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Contact Management System{% endblock %}</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body class="bg-light d-flex flex-column min-vh-100">

    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="{{ url_for('index') }}">
                <i class="bi bi-person-lines-fill fs-4"></i>
                <span>ContactHub</span>
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarMain">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link {% if request.endpoint == 'index' %}active fw-semibold{% endif %}" href="{{ url_for('index') }}">
                            <i class="bi bi-speedometer2 me-1"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {% if request.endpoint == 'contacts' or request.endpoint == 'search' %}active fw-semibold{% endif %}" href="{{ url_for('contacts') }}">
                            <i class="bi bi-people me-1"></i> All Contacts
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {% if request.endpoint == 'add_contact' %}active fw-semibold{% endif %}" href="{{ url_for('add_contact') }}">
                            <i class="bi bi-person-plus me-1"></i> Add Contact
                        </a>
                    </li>
                </ul>
                
                <!-- Quick Search Form in Navbar -->
                <form class="d-flex" action="{{ url_for('search') }}" method="GET">
                    <div class="input-group">
                        <input class="form-control form-control-sm" type="search" name="q" placeholder="Search name, phone, city..." value="{{ search_query if search_query else '' }}">
                        <button class="btn btn-light btn-sm" type="submit">
                            <i class="bi bi-search text-primary"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </nav>

    <!-- Main Content Container -->
    <main class="container my-4 flex-grow-1">
        <!-- Flash Alert Messages -->
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                <div class="flash-messages mb-4">
                    {% for category, message in messages %}
                        <div class="alert alert-{{ category }} alert-dismissible fade show shadow-sm d-flex align-items-center gap-2" role="alert">
                            {% if category == 'success' %}
                                <i class="bi bi-check-circle-fill fs-5"></i>
                            {% elif category == 'danger' %}
                                <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                            {% elif category == 'warning' %}
                                <i class="bi bi-exclamation-circle-fill fs-5"></i>
                            {% else %}
                                <i class="bi bi-info-circle-fill fs-5"></i>
                            {% endif %}
                            <div>{{ message }}</div>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    {% endfor %}
                </div>
            {% endif %}
        {% endwith %}

        <!-- Child Page Content Block -->
        {% block content %}{% endblock %}
    </main>

    <!-- Footer -->
    <footer class="bg-white py-3 border-top mt-auto text-center text-muted">
        <div class="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <small>&copy; 2026 <strong>ContactHub</strong> — Beginner-friendly Python Flask & SQLite Project</small>
            <div class="small">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-1"><i class="bi bi-filetype-py"></i> Python 3</span>
                <span class="badge bg-info-subtle text-info border border-info-subtle me-1"><i class="bi bi-database"></i> SQLite3</span>
                <span class="badge bg-secondary-subtle text-secondary border"><i class="bi bi-bootstrap"></i> Bootstrap 5</span>
            </div>
        </div>
    </footer>

    <!-- Bootstrap 5 JavaScript Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JavaScript -->
    <script src="{{ url_for('static', filename='js/script.js') }}"></script>
    {% block scripts %}{% endblock %}
</body>
</html>
`
  },
  {
    name: 'templates/index.html',
    path: 'contact_management/templates/index.html',
    language: 'html',
    description: 'Dashboard page with total contact counters, category breakdown statistics, and recent contacts table',
    content: `{% extends 'base.html' %}

{% block title %}Dashboard - Contact Management System{% endblock %}

{% block content %}
<div class="row align-items-center mb-4">
    <div class="col-md-7">
        <h2 class="fw-bold mb-1">Contacts Dashboard</h2>
        <p class="text-secondary mb-0">Overview of your contacts directory and quick operations</p>
    </div>
    <div class="col-md-5 text-md-end mt-3 mt-md-0">
        <a href="{{ url_for('add_contact') }}" class="btn btn-primary px-3 shadow-sm me-2">
            <i class="bi bi-person-plus-fill me-1"></i> Add Contact
        </a>
        <a href="{{ url_for('contacts') }}" class="btn btn-outline-secondary px-3">
            <i class="bi bi-grid-fill me-1"></i> View All
        </a>
    </div>
</div>

<!-- Metrics Statistics Cards -->
<div class="row g-3 mb-4">
    <div class="col-12 col-sm-6 col-lg-4">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 bg-gradient-primary text-white p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-white-50 text-uppercase fw-semibold small">Total Contacts</span>
                    <h2 class="display-5 fw-bold mb-0 mt-1">{{ total_contacts }}</h2>
                </div>
                <div class="stat-icon-wrapper bg-white bg-opacity-25 rounded-circle p-3">
                    <i class="bi bi-people-fill fs-2"></i>
                </div>
            </div>
            <div class="mt-3 pt-2 border-top border-white border-opacity-25 d-flex justify-content-between align-items-center">
                <span class="small text-white-50">Database: contacts.db</span>
                <a href="{{ url_for('contacts') }}" class="small text-white text-decoration-none fw-semibold">View list &rarr;</a>
            </div>
        </div>
    </div>

    <!-- Category Breakdown Cards -->
    <div class="col-6 col-sm-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 text-center p-3 h-100 bg-white hover-shadow transition">
            <div class="category-icon text-success mb-2">
                <i class="bi bi-house-heart-fill fs-3"></i>
            </div>
            <div class="fw-bold fs-4 text-dark">{{ category_counts.get('Family', 0) }}</div>
            <div class="text-muted small">Family</div>
            <a href="{{ url_for('contacts', category='Family') }}" class="stretched-link"></a>
        </div>
    </div>

    <div class="col-6 col-sm-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 text-center p-3 h-100 bg-white hover-shadow transition">
            <div class="category-icon text-info mb-2">
                <i class="bi bi-emoji-smile-fill fs-3"></i>
            </div>
            <div class="fw-bold fs-4 text-dark">{{ category_counts.get('Friends', 0) }}</div>
            <div class="text-muted small">Friends</div>
            <a href="{{ url_for('contacts', category='Friends') }}" class="stretched-link"></a>
        </div>
    </div>

    <div class="col-6 col-sm-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 text-center p-3 h-100 bg-white hover-shadow transition">
            <div class="category-icon text-warning mb-2">
                <i class="bi bi-mortarboard-fill fs-3"></i>
            </div>
            <div class="fw-bold fs-4 text-dark">{{ category_counts.get('College', 0) }}</div>
            <div class="text-muted small">College</div>
            <a href="{{ url_for('contacts', category='College') }}" class="stretched-link"></a>
        </div>
    </div>

    <div class="col-6 col-sm-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 text-center p-3 h-100 bg-white hover-shadow transition">
            <div class="category-icon text-primary mb-2">
                <i class="bi bi-briefcase-fill fs-3"></i>
            </div>
            <div class="fw-bold fs-4 text-dark">{{ category_counts.get('Work', 0) }}</div>
            <div class="text-muted small">Work</div>
            <a href="{{ url_for('contacts', category='Work') }}" class="stretched-link"></a>
        </div>
    </div>
</div>

<!-- Recently Added Contacts Section -->
<div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
            <i class="bi bi-clock-history text-primary"></i> Recently Added Contacts
        </h5>
        <a href="{{ url_for('contacts') }}" class="btn btn-sm btn-light">View All ({{ total_contacts }})</a>
    </div>
    <div class="card-body p-0">
        {% if recent_contacts %}
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">Contact</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Category</th>
                        <th class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {% for c in recent_contacts %}
                    <tr>
                        <td class="ps-4">
                            <div class="d-flex align-items-center gap-2">
                                <div class="avatar-circle bg-primary-subtle text-primary fw-bold">
                                    {{ c.full_name[:2].upper() }}
                                </div>
                                <div>
                                    <a href="{{ url_for('view_contact', id=c.id) }}" class="fw-semibold text-dark text-decoration-none hover-primary">
                                        {{ c.full_name }}
                                    </a>
                                </div>
                            </div>
                        </td>
                        <td>
                            <a href="tel:{{ c.phone }}" class="text-decoration-none text-secondary">
                                <i class="bi bi-telephone text-muted me-1"></i>{{ c.phone }}
                            </a>
                        </td>
                        <td>{{ c.email if c.email else '<span class="text-muted fst-italic">None</span>'|safe }}</td>
                        <td>{{ c.city if c.city else '-' }}</td>
                        <td>
                            <span class="badge category-badge-{{ c.category|lower }} px-2 py-1">
                                {{ c.category }}
                            </span>
                        </td>
                        <td class="text-end pe-4">
                            <div class="btn-group btn-group-sm">
                                <a href="{{ url_for('view_contact', id=c.id) }}" class="btn btn-outline-primary"><i class="bi bi-eye"></i></a>
                                <a href="{{ url_for('edit_contact', id=c.id) }}" class="btn btn-outline-secondary"><i class="bi bi-pencil"></i></a>
                                <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="{{ c.id }}" data-name="{{ c.full_name }}"><i class="bi bi-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% else %}
        <div class="text-center py-5">
            <i class="bi bi-person-x display-4 text-muted"></i>
            <h5 class="mt-3 text-secondary">No Contacts in Database</h5>
            <p class="text-muted small">Your contact list is currently empty. Start by adding your first contact!</p>
            <a href="{{ url_for('add_contact') }}" class="btn btn-primary mt-2">
                <i class="bi bi-person-plus-fill me-1"></i> Add Your First Contact
            </a>
        </div>
        {% endif %}
    </div>
</div>
`
  },
  {
    name: 'templates/contacts.html',
    path: 'contact_management/templates/contacts.html',
    language: 'html',
    description: 'All contacts view with real-time multi-field search, category badges, sorting, and action buttons',
    content: `{% extends 'base.html' %}

{% block title %}All Contacts - ContactHub{% endblock %}

{% block content %}
<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
    <div>
        <h2 class="fw-bold mb-1">
            {% if is_search_result %}Search Results{% else %}All Contacts{% endif %}
        </h2>
        <p class="text-secondary mb-0">
            {% if is_search_result %}
                Showing results for query: "<strong>{{ search_query }}</strong>" ({{ contacts|length }} found)
            {% else %}
                Managing {{ total_count }} registered personal and professional contacts
            {% endif %}
        </p>
    </div>
    <div class="d-flex gap-2">
        {% if is_search_result %}
            <a href="{{ url_for('contacts') }}" class="btn btn-outline-secondary">Clear Search</a>
        {% endif %}
        <a href="{{ url_for('add_contact') }}" class="btn btn-primary shadow-sm">
            <i class="bi bi-person-plus-fill me-1"></i> Add Contact
        </a>
    </div>
</div>

<!-- Search & Filter Controls -->
<div class="card border-0 shadow-sm rounded-4 mb-4">
    <div class="card-body p-3">
        <form action="{{ url_for('search') }}" method="GET" class="row g-2 align-items-center">
            <div class="col-12 col-md-5">
                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" name="q" class="form-control border-start-0 bg-light" placeholder="Search by name, phone, email, city..." value="{{ search_query if search_query else '' }}">
                </div>
            </div>
            <div class="col-6 col-md-3">
                <select name="category" class="form-select bg-light" onchange="this.form.submit()">
                    <option value="All" {% if selected_category == 'All' or not selected_category %}selected{% endif %}>All Categories</option>
                    <option value="Family" {% if selected_category == 'Family' %}selected{% endif %}>Family</option>
                    <option value="Friends" {% if selected_category == 'Friends' %}selected{% endif %}>Friends</option>
                    <option value="College" {% if selected_category == 'College' %}selected{% endif %}>College</option>
                    <option value="Work" {% if selected_category == 'Work' %}selected{% endif %}>Work</option>
                    <option value="Other" {% if selected_category == 'Other' %}selected{% endif %}>Other</option>
                </select>
            </div>
            <div class="col-6 col-md-2">
                <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-funnel me-1"></i> Filter
                </button>
            </div>
            <div class="col-12 col-md-2 text-md-end">
                <div class="dropdown">
                    <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-sort-down me-1"></i> Sort
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow">
                        <li><a class="dropdown-item" href="{{ url_for('contacts', sort='name_asc', category=selected_category) }}">Name (A to Z)</a></li>
                        <li><a class="dropdown-item" href="{{ url_for('contacts', sort='name_desc', category=selected_category) }}">Name (Z to A)</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="{{ url_for('contacts', sort='date_desc', category=selected_category) }}">Newest First</a></li>
                        <li><a class="dropdown-item" href="{{ url_for('contacts', sort='date_asc', category=selected_category) }}">Oldest First</a></li>
                    </ul>
                </div>
            </div>
        </form>
    </div>
</div>

{% if contacts %}
<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th class="ps-4">Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>City</th>
                    <th class="text-end pe-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                {% for c in contacts %}
                <tr>
                    <td class="ps-4">
                        <div class="d-flex align-items-center gap-3">
                            <div class="avatar-circle bg-primary-subtle text-primary fw-bold">
                                {{ c.full_name[:2].upper() }}
                            </div>
                            <div>
                                <a href="{{ url_for('view_contact', id=c.id) }}" class="fw-semibold text-dark text-decoration-none hover-primary">
                                    {{ c.full_name }}
                                </a>
                                {% if c.notes %}
                                <div class="small text-muted text-truncate" style="max-width: 200px;">{{ c.notes }}</div>
                                {% endif %}
                            </div>
                        </div>
                    </td>
                    <td>
                        <a href="tel:{{ c.phone }}" class="text-decoration-none text-secondary">
                            <i class="bi bi-telephone text-muted me-1"></i>{{ c.phone }}
                        </a>
                    </td>
                    <td>{{ c.email if c.email else '<span class="text-muted fst-italic">None</span>'|safe }}</td>
                    <td><span class="badge category-badge-{{ c.category|lower }} px-2 py-1">{{ c.category }}</span></td>
                    <td>{{ c.city if c.city else '-' }}</td>
                    <td class="text-end pe-4">
                        <div class="btn-group btn-group-sm">
                            <a href="{{ url_for('view_contact', id=c.id) }}" class="btn btn-outline-primary" title="View"><i class="bi bi-eye"></i></a>
                            <a href="{{ url_for('edit_contact', id=c.id) }}" class="btn btn-outline-secondary" title="Edit"><i class="bi bi-pencil"></i></a>
                            <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="{{ c.id }}" data-name="{{ c.full_name }}" title="Delete"><i class="bi bi-trash"></i></button>
                        </div>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>
</div>
{% else %}
<div class="card border-0 shadow-sm rounded-4 text-center py-5">
    <div class="card-body">
        <i class="bi bi-search display-3 text-muted"></i>
        <h4 class="mt-3 fw-bold text-dark">No contacts found</h4>
        <p class="text-muted">No matching results for your query. Try searching for a different keyword or reset filters.</p>
        <a href="{{ url_for('contacts') }}" class="btn btn-outline-secondary mt-2">View All Contacts</a>
    </div>
</div>
{% endif %}
`
  },
  {
    name: 'templates/add_contact.html',
    path: 'contact_management/templates/add_contact.html',
    language: 'html',
    description: 'Add Contact form with full validation, clean input groups, and category selection',
    content: `{% extends 'base.html' %}

{% block title %}Add New Contact - ContactHub{% endblock %}

{% block content %}
<div class="row justify-content-center">
    <div class="col-12 col-md-10 col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-header bg-primary text-white py-3 px-4">
                <h5 class="fw-bold mb-0"><i class="bi bi-person-plus-fill me-2"></i>Create New Contact</h5>
                <small class="text-white-50">Fill in the contact information below to save in SQLite database</small>
            </div>
            <div class="card-body p-4">
                <form action="{{ url_for('add_contact') }}" method="POST" class="needs-validation" novalidate>
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label for="full_name" class="form-label fw-semibold">Full Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="full_name" name="full_name" placeholder="e.g. John Doe" required value="{{ form_data.get('full_name', '') }}">
                            <div class="invalid-feedback">Full name is required.</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="phone" class="form-label fw-semibold">Phone Number <span class="text-danger">*</span></label>
                            <input type="tel" class="form-control" id="phone" name="phone" placeholder="e.g. +1 (555) 000-1234" required value="{{ form_data.get('phone', '') }}">
                            <div class="invalid-feedback">Phone number is required.</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="email" class="form-label fw-semibold">Email Address</label>
                            <input type="email" class="form-control" id="email" name="email" placeholder="e.g. john@example.com" value="{{ form_data.get('email', '') }}">
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="category" class="form-label fw-semibold">Category <span class="text-danger">*</span></label>
                            <select class="form-select" id="category" name="category" required>
                                <option value="Family">Family</option>
                                <option value="Friends">Friends</option>
                                <option value="College">College</option>
                                <option value="Work">Work</option>
                                <option value="Other" selected>Other</option>
                            </select>
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="city" class="form-label fw-semibold">City</label>
                            <input type="text" class="form-control" id="city" name="city" placeholder="e.g. Springfield" value="{{ form_data.get('city', '') }}">
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="address" class="form-label fw-semibold">Address</label>
                            <input type="text" class="form-control" id="address" name="address" placeholder="e.g. 742 Evergreen Terrace" value="{{ form_data.get('address', '') }}">
                        </div>
                        <div class="col-12">
                            <label for="notes" class="form-label fw-semibold">Notes / Description</label>
                            <textarea class="form-control" id="notes" name="notes" rows="3" placeholder="Additional notes...">{{ form_data.get('notes', '') }}</textarea>
                        </div>
                        <div class="col-12 pt-3 border-top d-flex gap-2 justify-content-end">
                            <a href="{{ url_for('contacts') }}" class="btn btn-light px-4">Cancel</a>
                            <button type="submit" class="btn btn-primary px-4 shadow-sm">Save Contact</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
{% endblock %}
`
  },
  {
    name: 'templates/edit_contact.html',
    path: 'contact_management/templates/edit_contact.html',
    language: 'html',
    description: 'Edit Contact form pre-populated with database values for easy updating',
    content: `{% extends 'base.html' %}

{% block title %}Edit Contact: {{ contact.full_name }} - ContactHub{% endblock %}

{% block content %}
<div class="row justify-content-center">
    <div class="col-12 col-md-10 col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-header bg-secondary text-white py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0"><i class="bi bi-pencil-square me-2"></i>Edit Contact #{{ contact.id }}</h5>
                <span class="badge bg-light text-dark">ID: #{{ contact.id }}</span>
            </div>
            <div class="card-body p-4">
                <form action="{{ url_for('edit_contact', id=contact.id) }}" method="POST" class="needs-validation" novalidate>
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label for="full_name" class="form-label fw-semibold">Full Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="full_name" name="full_name" required value="{{ contact.full_name }}">
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="phone" class="form-label fw-semibold">Phone Number <span class="text-danger">*</span></label>
                            <input type="tel" class="form-control" id="phone" name="phone" required value="{{ contact.phone }}">
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="email" class="form-label fw-semibold">Email Address</label>
                            <input type="email" class="form-control" id="email" name="email" value="{{ contact.email if contact.email else '' }}">
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="category" class="form-label fw-semibold">Category <span class="text-danger">*</span></label>
                            <select class="form-select" id="category" name="category" required>
                                <option value="Family" {% if contact.category == 'Family' %}selected{% endif %}>Family</option>
                                <option value="Friends" {% if contact.category == 'Friends' %}selected{% endif %}>Friends</option>
                                <option value="College" {% if contact.category == 'College' %}selected{% endif %}>College</option>
                                <option value="Work" {% if contact.category == 'Work' %}selected{% endif %}>Work</option>
                                <option value="Other" {% if contact.category == 'Other' %}selected{% endif %}>Other</option>
                            </select>
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="city" class="form-label fw-semibold">City</label>
                            <input type="text" class="form-control" id="city" name="city" value="{{ contact.city if contact.city else '' }}">
                        </div>
                        <div class="col-12 col-md-6">
                            <label for="address" class="form-label fw-semibold">Address</label>
                            <input type="text" class="form-control" id="address" name="address" value="{{ contact.address if contact.address else '' }}">
                        </div>
                        <div class="col-12">
                            <label for="notes" class="form-label fw-semibold">Notes / Description</label>
                            <textarea class="form-control" id="notes" name="notes" rows="3">{{ contact.notes if contact.notes else '' }}</textarea>
                        </div>
                        <div class="col-12 pt-3 border-top d-flex gap-2 justify-content-end">
                            <a href="{{ url_for('view_contact', id=contact.id) }}" class="btn btn-light px-4">Cancel</a>
                            <button type="submit" class="btn btn-success px-4 shadow-sm">Update Contact</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
{% endblock %}
`
  },
  {
    name: 'templates/view_contact.html',
    path: 'contact_management/templates/view_contact.html',
    language: 'html',
    description: 'Detailed view page showing full contact details, click-to-call, email, and actions',
    content: `{% extends 'base.html' %}

{% block title %}{{ contact.full_name }} - Details - ContactHub{% endblock %}

{% block content %}
<div class="row justify-content-center">
    <div class="col-12 col-md-10 col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div class="bg-gradient-primary text-white p-4">
                <div class="d-flex flex-column flex-sm-row align-items-center gap-3">
                    <div class="avatar-large bg-white text-primary shadow fw-bold fs-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                        {{ contact.full_name[:2].upper() }}
                    </div>
                    <div class="text-center text-sm-start flex-grow-1">
                        <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                            <h3 class="fw-bold mb-0">{{ contact.full_name }}</h3>
                            <span class="badge category-badge-{{ contact.category|lower }} px-2 py-1">{{ contact.category }}</span>
                        </div>
                        <p class="text-white-50 mb-0 small">Added: {{ contact.created_at }} &bull; Contact ID: #{{ contact.id }}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="{{ url_for('edit_contact', id=contact.id) }}" class="btn btn-light btn-sm px-3 shadow-sm">
                            <i class="bi bi-pencil me-1"></i> Edit
                        </a>
                        <button type="button" class="btn btn-outline-light btn-sm px-3" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="{{ contact.id }}" data-name="{{ contact.full_name }}">
                            <i class="bi bi-trash me-1"></i> Delete
                        </button>
                    </div>
                </div>
            </div>

            <div class="card-body p-4">
                <div class="row g-4">
                    <div class="col-sm-6">
                        <div class="p-3 bg-light rounded-3 h-100">
                            <small class="text-muted text-uppercase fw-semibold d-block mb-1">Phone Number</small>
                            <a href="tel:{{ contact.phone }}" class="fs-5 fw-bold text-dark text-decoration-none">{{ contact.phone }}</a>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="p-3 bg-light rounded-3 h-100">
                            <small class="text-muted text-uppercase fw-semibold d-block mb-1">Email Address</small>
                            {% if contact.email %}
                            <a href="mailto:{{ contact.email }}" class="fs-5 fw-bold text-dark text-decoration-none text-break">{{ contact.email }}</a>
                            {% else %}
                            <span class="text-muted fst-italic">Not provided</span>
                            {% endif %}
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="p-3 bg-light rounded-3">
                            <small class="text-muted text-uppercase fw-semibold d-block mb-1">Location & Address</small>
                            <div class="fw-semibold text-dark">{{ contact.address }}{% if contact.city %}, {{ contact.city }}{% endif %}</div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="p-3 bg-light rounded-3">
                            <small class="text-muted text-uppercase fw-semibold d-block mb-1">Notes & Remarks</small>
                            <p class="mb-0 text-dark">{{ contact.notes if contact.notes else 'No notes available' }}</p>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <a href="{{ url_for('contacts') }}" class="btn btn-outline-secondary">&larr; Back to All Contacts</a>
                    <a href="{{ url_for('edit_contact', id=contact.id) }}" class="btn btn-primary">Edit Contact</a>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
`
  },
  {
    name: 'static/css/style.css',
    path: 'contact_management/static/css/style.css',
    language: 'css',
    description: 'Custom styling for badge colors, avatars, and card hover animations',
    content: `/* Custom styles for ContactHub */
body {
    background-color: #f8fafc;
    font-family: 'Inter', sans-serif;
}
.bg-gradient-primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
}
.avatar-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.hover-shadow:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
}
.category-badge-family { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.category-badge-friends { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.category-badge-college { background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.category-badge-work { background-color: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.category-badge-other { background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
`
  },
  {
    name: 'static/js/script.js',
    path: 'contact_management/static/js/script.js',
    language: 'javascript',
    description: 'Client-side script for dynamic modal wiring and auto-dismissing alerts',
    content: `document.addEventListener('DOMContentLoaded', function () {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            if (!button) return;
            const contactId = button.getAttribute('data-id');
            const contactName = button.getAttribute('data-name');
            const deleteContactNameElem = document.getElementById('deleteContactName');
            const deleteForm = document.getElementById('deleteForm');
            if (deleteContactNameElem) deleteContactNameElem.textContent = contactName;
            if (deleteForm) deleteForm.setAttribute('action', '/delete/' + contactId);
        });
    }

    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) bsAlert.close();
        }, 5000);
    });
});
`
  },
  {
    name: 'README.md',
    path: 'contact_management/README.md',
    language: 'markdown',
    description: 'Full installation and execution guide for the Flask project',
    content: `# Contact Management System (Python Flask + SQLite)

## Quick Start on Localhost
1. \`cd contact_management\`
2. \`pip install -r requirements.txt\`
3. \`python init_db.py\`
4. \`python app.py\`
5. Open browser at \`http://127.0.0.1:5000\`

### Windows 1-Click:
Double-click \`run.bat\`

### Mac/Linux 1-Click:
Run \`bash run.sh\`
`
  },
  {
    name: 'run.bat',
    path: 'contact_management/run.bat',
    language: 'plaintext',
    description: 'Windows 1-Click Launcher: Automatically checks Python, installs dependencies, initializes SQLite, and opens http://127.0.0.1:5000 in browser',
    content: `@echo off
title Contact Management System - Flask Server
color 0A

echo ========================================================
echo    Contact Management System (Python Flask + SQLite)
echo ========================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3 from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b
)

echo [1/3] Installing / Checking required dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install with standard pip. Trying python -m pip...
    python -m pip install -r requirements.txt
)

echo.
echo [2/3] Initializing SQLite database (contacts.db)...
python init_db.py

echo.
echo [3/3] Starting Flask Application...
echo The app will open in your browser at http://127.0.0.1:5000
echo Press Ctrl+C in this window anytime to stop the server.
echo.

start "" http://127.0.0.1:5000
python app.py

pause
`
  },
  {
    name: 'run.sh',
    path: 'contact_management/run.sh',
    language: 'plaintext',
    description: 'macOS & Linux 1-Click Launcher: Installs requirements, initializes SQLite database, and runs Flask on localhost:5000',
    content: `#!/usr/bin/env bash
# Contact Management System - Run Script for Linux & macOS

echo "========================================================"
echo "   Contact Management System (Python Flask + SQLite)"
echo "========================================================"
echo ""

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3 (e.g. brew install python3 or sudo apt install python3 python3-pip)"
    exit 1
fi

echo "[1/3] Installing dependencies..."
python3 -m pip install -r requirements.txt

echo ""
echo "[2/3] Initializing SQLite database (contacts.db)..."
python3 init_db.py

echo ""
echo "[3/3] Starting Flask Application on http://127.0.0.1:5000 ..."
echo "Press Ctrl+C to stop the server anytime."
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://127.0.0.1:5000 &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://127.0.0.1:5000 &> /dev/null &
fi

python3 app.py
`
  }
];
