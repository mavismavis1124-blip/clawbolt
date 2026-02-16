#!/bin/bash
# Start static file server for simple-showcase

PORT=${1:-3456}
cd ~/clawd/simple-showcase/dist

echo "Starting server on port $PORT..."
python3 -m http.server $PORT &
sleep 2
echo "Server running at http://localhost:$PORT"
echo "Starting Cloudflare tunnel..."
cloudflared tunnel --url http://localhost:$PORT