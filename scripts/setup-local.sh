#!/bin/bash
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.local.example .env
  echo "Created .env from .env.local.example"
fi

echo "Starting Postgres..."
docker compose up -d

echo "Waiting for database..."
sleep 3

npx prisma db push
npm run db:seed

echo ""
echo "Ready! Run: npm run dev"
echo "  Home:     http://localhost:3000"
echo "  Customer: http://localhost:3000/order/demo-table-1"
