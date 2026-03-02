#!/usr/bin/env python
"""Script to create admin user for Municipal Management System."""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'municipal_backend.settings')
django.setup()

from django.contrib.auth.models import User

def create_admin():
    username = 'admin'
    email = 'admin@municipal.gov'
    password = 'admin123'
    
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"Admin user created: {username} / {password}")
    else:
        print("Admin user already exists.")

if __name__ == '__main__':
    create_admin()
