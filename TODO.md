# Deployment to Render.com - TODO List

## Tasks
- [x] 1. Update municipal_backend/settings.py for production static file serving
- [x] 2. Create build.sh script for Render's build process
- [x] 3. Update Procfile for the deployment
- [x] 4. Create runtime.txt for Python version

## Completed
- [x] Analyzed project structure

## Render.com Deployment Steps

After pushing these changes to GitHub, follow these steps on Render.com:

1. **Create a new Web Service** on Render.com
2. **Connect your GitHub repository**
3. **Configure the following settings**:
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn municipal_backend.wsgi --log-file -`
4. **Add Environment Variables**:
   - `SECRET_KEY`: Generate a secure key (e.g., using Django's secret generator)
   - `DEBUG`: `False`
   - `DB_NAME`: Your PostgreSQL database name
   - `DB_USER`: Your PostgreSQL username
   - `DB_PASSWORD`: Your PostgreSQL password
   - `DB_HOST`: Your PostgreSQL host (provided by Render)
   - `DB_PORT`: `5432`
5. **Create a PostgreSQL database** on Render.com and link it to your web service

## Files Created/Modified
- `municipal_backend/settings.py` - Added STATICFILES_DIRS and STORAGES for WhiteNoise
- `municipal_backend/urls.py` - Added TemplateView for serving React frontend
- `build.sh` - Build script for Render
- `runtime.txt` - Python version specification
- `Procfile` - Already configured (no changes needed)
