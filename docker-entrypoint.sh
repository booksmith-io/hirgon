#!/bin/sh
set -e

cd /app

# generate session secret for production if not set
if [ "$NODE_ENV" = "production" ]; then
    if [ -z "$HIRGON_SESSION_SECRET_PRODUCTION" ]; then
        if grep -q '"production": ""' /app/.hirgonrc 2>/dev/null; then
            echo "generating session secret for production"
            export HIRGON_SESSION_SECRET_PRODUCTION=$(openssl rand -hex 32)
            echo "session secret generated"
        fi
    fi
fi

# initialize database if it doesn't exist
if [ ! -f /app/db/hirgon.sqlite3 ]; then
    echo "creating database"
    bash bin/create_database
fi

# apply any pending patches
echo "applying database patches"
bash bin/apply_database_patches

# ensure directories exist
mkdir -p /app/db

exec "$@"
