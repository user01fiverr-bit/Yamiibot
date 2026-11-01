#!/bin/bash
cd ~/freshbot
while true; do
  node index.js
  echo "---------------------------------------------------"
  echo "⚠️ BOT DIED! Auto-restarting in 5 seconds..."
  echo "---------------------------------------------------"
  sleep 5
done
