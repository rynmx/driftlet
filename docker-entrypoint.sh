#!/bin/sh
# docker-entrypoint.sh

# It's a good practice to wait for the database to be ready.
# This is a simple version. For production, you might use a more robust tool like wait-for-it.sh
# We will assume the db is ready for this example, but you might need to add a wait loop here.

echo "Running database initialization..."
npm run db:init

echo "Running database seeding..."
npm run db:seed

echo "Database setup complete. Starting application..."

# Execute the original command (CMD from Dockerfile)
exec "$@"
