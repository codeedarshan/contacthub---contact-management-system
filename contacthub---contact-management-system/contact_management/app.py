"""
Contact Management System
Backend: Python Flask + SQLite
A complete beginner-friendly web application for managing personal & professional contacts.
"""

from flask import Flask, render_to_string, render_template, request, redirect, url_for, flash
import sqlite3
import os
from datetime import datetime

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
            ('Sarah Connor', '+1 (555) 987-6543', 'sarah.c@familydomain.net', '124 Conch Street', 'Bikini Bottom', 'Family', 'Cousin Sarah - birthday is on November 15th.'),
            ('David Miller', '+1 (555) 345-6789', 'dmiller@university.edu', '456 College Ave, Apt 3B', 'Boston', 'College', 'Lab partner for Advanced Data Structures and Algorithms.'),
            ('Emma Watson', '+1 (555) 876-5432', 'emma.watson@creativemail.org', '10 Downing Street', 'London', 'Friends', 'Met at the annual tech conference. Loves hiking and photography.'),
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
