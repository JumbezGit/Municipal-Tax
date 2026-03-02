# Municipal Management System

A full-stack Django + React web application for municipal tax management.

## Features

### Taxpayer Features
- Register and login
- View property tax amount
- Make payments
- View payment history

### Admin Features
- Dashboard with statistics
- View all taxpayers and payments
- View unpaid taxpayers
- Print reports for unpaid taxpayers

## Tech Stack
- **Backend**: Django 4.2, Django REST Framework, JWT Authentication
- **Frontend**: React 18, Bootstrap 5, Axios
- **Database**: PostgreSQL (for production), SQLite (for development)
- **Deployment**: Ready for Render.com

## Project Structure
```
municipal_backend/    # Django backend
municipal/           # Django app
municipal_frontend/  # React frontend
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL (for production)

### Backend Setup

1. Navigate to project directory:
```
bash
cd Municipal_New
```

2. Create virtual environment (optional):
```
bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```
bash
pip install -r requirements.txt
```

4. Run migrations:
```
bash
python manage.py migrate
```

5. Create admin user:
```
bash
python setup_admin.py
# Default admin: admin / admin123
```

6. Run development server:
```
bash
python manage.py runserver
```

The API will be available at: http://localhost:8000/api/

### Frontend Setup

1. Navigate to frontend directory:
```
bash
cd municipal_frontend
```

2. Install dependencies:
```
bash
npm install
```

3. Run development server:
```
bash
npm start
```

The frontend will be available at: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/register/ | Register taxpayer | No |
| POST | /api/login/ | Login | No |
| GET | /api/profile/ | Get taxpayer profile | Yes |
| GET/POST | /api/payments/ | Get/make payments | Yes |
| GET | /api/admin/dashboard/ | Admin statistics | Admin |
| GET | /api/admin/taxpayers/ | All taxpayers | Admin |
| GET | /api/admin/payments/ | All payments | Admin |
| GET | /api/admin/unpaid/ | Unpaid taxpayers | Admin |

## Deployment to Render.com

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect to your GitHub repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn municipal_backend.wsgi --log-file -`
5. Add environment variables:
   - `DB_NAME`: PostgreSQL database name
   - `DB_USER`: PostgreSQL username
   - `DB_PASSWORD`: PostgreSQL password
   - `DB_HOST`: PostgreSQL host
   - `DB_PORT`: PostgreSQL port (default: 5432)
   - `SECRET_KEY`: Django secret key
   - `DEBUG`: False

## Usage

1. **Admin Login**: Access `/login` with admin credentials (admin/admin123)
2. **Taxpayer Registration**: New taxpayers can register at `/register`
3. **Make Payments**: Taxpayers can pay their property tax from their dashboard
4. **Print Reports**: Admin can print unpaid taxpayer reports from the dashboard
"# Municipal-Tax" 
