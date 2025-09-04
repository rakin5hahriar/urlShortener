#!/bin/bash

echo "🚀 Setting up URL Shortener Project..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo ""

# Copy environment file for backend
if [ ! -f .env ]; then
    echo "🔧 Creating backend environment file..."
    cp .env.example .env
    echo "✅ Backend .env file created. Please configure your environment variables."
else
    echo "⚠️  Backend .env file already exists."
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo ""

# Copy environment file for frontend
if [ ! -f .env ]; then
    echo "🔧 Creating frontend environment file..."
    cp .env.example .env
    echo "✅ Frontend .env file created."
else
    echo "⚠️  Frontend .env file already exists."
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running on your system"
echo "2. Configure your environment variables in backend/.env"
echo "3. Run 'npm run dev' to start both frontend and backend in development mode"
echo ""
echo "🔗 Development URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   API Docs: http://localhost:5000/health"
echo ""
