# Render.com PostgreSQL Database Setup Guide

## Option 1: Create Database from Render Dashboard

### Step 1: Create a New PostgreSQL Database

1. **Log in to Render.com** and go to your dashboard
2. Click on **"New +"** button in the top-right corner
3. Select **"PostgreSQL"** from the dropdown menu
4. Fill in the following details:
   - **Name**: `municipal_db` (or your preferred name)
   - **Database Name**: `municipal_db`
   - **User**: `postgres` (default)
   - **Region**: Choose the region closest to your web service
5. Click **"Create Database"**

### Step 2: Get Database Connection Details

After creation, click on your database to view its details. You'll see:
- **Host** (e.g., `dpg-xxxxx.render.internal`)
- **Port** (usually `5432`)
- **Database name**
- **User**
- **Password** (click "Show" to reveal)

### Step 3: Link Database to Your Web Service

**Method A - From Web Service Settings:**
1. Go to your **Web Service** on Render
2. Click on **"Environment"** in the left sidebar
3. Scroll down to **"Environment Variables"**
4. Add the following variables with values from your database:
   
```
   DB_NAME: <database_name>
   DB_USER: postgres
   DB_PASSWORD: <your_password>
   DB_HOST: <your_host>
   DB_PORT: 5432
   
```

**Method B - From Database Settings:**
1. Go to your **PostgreSQL database** page
2. Click on **"Connect"** 
3. Under **"External Connection"**, copy the connection string
4. Go to your **Web Service** → **Environment**
5. Add environment variable:
   
```
   DATABASE_URL: <paste_connection_string>
   
```

## Option 2: Use Render's Auto-Provisioned Database

When creating your Web Service, you can let Render automatically create and link a database:

1. While creating your **Web Service**, scroll to the **"DB"** section
2. Click **"Create a new PostgreSQL database"**
3. Enter a name for your database
4. Continue with the web service creation

Render will automatically:
- Create the PostgreSQL database
- Add the `DATABASE_URL` environment variable to your web service

## Using DATABASE_URL (Recommended)

If you use `DATABASE_URL`, update your `settings.py` to use it:

```
python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=f"postgres://{os.environ.get('DB_USER', 'postgres')}:{os.environ.get('DB_PASSWORD', 'postgres')}@{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '5432')}/{os.environ.get('DB_NAME', 'municipal_db')}"
    )
}
```

Or simply:
```
python
DATABASES['default'] = dj_database_url.config()
```

## Verifying the Connection

After deployment, you can verify the database connection:

1. Check your Render dashboard for the web service logs
2. Look for successful migration messages in the build log
3. Try accessing your application to ensure it's working

## Troubleshooting

- **"Database does not exist"**: Make sure the database name matches exactly
- **"Connection refused"**: Verify the host and port are correct
- **"Authentication failed"**: Double-check the username and password
- **"Permission denied"**: Ensure the database user has access to the database
