# Deployment to Render.com - TODO List

## Tasks Completed
- [x] 1. Update municipal_backend/settings.py for production static file serving
- [x] 2. Create build.sh script for Render's build process
- [x] 3. Update Procfile for the deployment
- [x] 4. Create runtime.txt for Python version

## Files Created/Modified
- `municipal_backend/settings.py` - Added:
  - `DIRS` pointing to React build directory for template lookup
  - `STATICFILES_DIRS` with conditional path for React static files
  - `STORAGES` for WhiteNoise compressed static files
- `municipal_backend/urls.py` - Added TemplateView for serving React frontend
- `build.sh` - Build script for Render
- `runtime.txt` - Python version specification (python-3.11.0)
- `Procfile` - Already configured (web: gunicorn municipal_backend.wsgi --log-file -)

## Fix Applied
- Updated `TEMPLATES['DIRS']` to include `BASE_DIR / 'municipal_frontend' / 'build'` to fix the 500 error
- Updated `STATICFILES_DIRS` to conditionally include React static files only when they exist

## Render.com Deployment Steps
1. Push all changes to your GitHub repository
2. Create a new Web Service on Render.com
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn municipal_backend.wsgi --log-file -`
5. Add Environment Variables:
   - `SECRET_KEY`: Generate a secure Django secret key
   - `DEBUG`: `False`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: From Render's PostgreSQL
6. Create a PostgreSQL database on Render.com and link it to your web service
