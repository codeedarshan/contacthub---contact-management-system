"""
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
            ('Sarah Connor', '+1 (555) 987-6543', 'sarah.c@familydomain.net', '124 Conch Street', 'Bikini Bottom', 'Family', 'Cousin Sarah - birthday is on November 15th.'),
            ('David Miller', '+1 (555) 345-6789', 'dmiller@university.edu', '456 College Ave, Apt 3B', 'Boston', 'College', 'Lab partner for Advanced Data Structures and Algorithms.'),
            ('Emma Watson', '+1 (555) 876-5432', 'emma.watson@creativemail.org', '10 Downing Street', 'London', 'Friends', 'Met at the annual tech conference. Loves hiking and photography.'),
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
