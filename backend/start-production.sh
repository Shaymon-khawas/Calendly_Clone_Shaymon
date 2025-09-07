#!/bin/bash

# Production startup script with memory optimizations
echo "Starting Meetly Backend in Production Mode..."

# Set Node.js memory options
export NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"

# Set production environment
export NODE_ENV=production

# Build the application
echo "Building TypeScript..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful, starting server..."
    # Start the application
    npm run start:prod
else
    echo "Build failed, exiting..."
    exit 1
fi
