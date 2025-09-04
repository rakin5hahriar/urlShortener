# URL Shortener Setup Script for Windows PowerShell

Write-Host "🚀 Setting up URL Shortener Project..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v16 or higher." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install

# Copy environment file for backend
if (-not (Test-Path .env)) {
    Write-Host "🔧 Creating backend environment file..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "✅ Backend .env file created. Please configure your environment variables." -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env file already exists." -ForegroundColor Yellow
}

Set-Location ..

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install

# Copy environment file for frontend
if (-not (Test-Path .env)) {
    Write-Host "🔧 Creating frontend environment file..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "✅ Frontend .env file created." -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env file already exists." -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running on your system"
Write-Host "2. Configure your environment variables in backend/.env"
Write-Host "3. Run 'npm run dev' to start both frontend and backend in development mode"
Write-Host ""
Write-Host "🔗 Development URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173"
Write-Host "   Backend:  http://localhost:5000"
Write-Host "   API Docs: http://localhost:5000/health"
Write-Host ""
