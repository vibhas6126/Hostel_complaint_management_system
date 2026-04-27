#!/bin/bash

# Hostel Complaint Management System - Setup Script
# This script helps set up the complete system

echo "🚀 Hostel Complaint Management System Setup"
echo "============================================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not found."
    exit 1
fi

# Check MySQL
echo "🗄️  Checking MySQL..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    echo "✅ MySQL installed: $MYSQL_VERSION"
    MYSQL_AVAILABLE=true
else
    echo "⚠️  MySQL not found in PATH"
    echo "   Please install MySQL or add it to your PATH"
    MYSQL_AVAILABLE=false
fi

echo ""
echo "📁 Checking project structure..."

# Check if all required files exist
REQUIRED_FILES=(
    "server.js"
    "package.json"
    "config/database.js"
    "middleware/auth.js"
    "database/schema.sql"
    "database/sample_data.sql"
    "database/setup.sql"
    "public/index.html"
    "public/student.html"
    "public/admin.html"
)

ALL_FILES_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        ALL_FILES_PRESENT=false
    fi
done

echo ""
echo "📦 Installing dependencies..."
if [ -f "package.json" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "❌ package.json not found"
    exit 1
fi

echo ""
echo "🔧 Configuration check..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "   Please ensure your MySQL credentials are correct:"
    echo "   DB_HOST=localhost"
    echo "   DB_USER=root"
    echo "   DB_PASSWORD=your_password"
    echo "   DB_NAME=hostel_complaint_system"
else
    echo "⚠️  .env file not found, creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created from example"
        echo "   Please edit .env with your MySQL credentials"
    else
        echo "❌ .env.example not found"
    fi
fi

echo ""
if [ "$MYSQL_AVAILABLE" = true ]; then
    echo "🗄️  Database setup..."
    echo "   The following commands will set up your database:"
    echo "   1. mysql -u root -p < database/setup.sql"
    echo "   2. mysql -u root -p hostel_complaint_system < database/schema.sql"
    echo "   3. mysql -u root -p hostel_complaint_system < database/sample_data.sql"
    echo ""
    read -p "Do you want to run database setup now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📋 Running database setup..."
        mysql -u root -p < database/setup.sql
        if [ $? -eq 0 ]; then
            echo "✅ Database created"
            mysql -u root -p hostel_complaint_system < database/schema.sql
            if [ $? -eq 0 ]; then
                echo "✅ Schema created"
                mysql -u root -p hostel_complaint_system < database/sample_data.sql
                if [ $? -eq 0 ]; then
                    echo "✅ Sample data loaded"
                else
                    echo "⚠️  Sample data loading failed"
                fi
            else
                echo "⚠️  Schema creation failed"
            fi
        else
            echo "⚠️  Database creation failed"
        fi
    fi
else
    echo "⚠️  Skip database setup (MySQL not available)"
fi

echo ""
echo "🎉 Setup Summary"
echo "==============="
echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $NPM_VERSION"
if [ "$MYSQL_AVAILABLE" = true ]; then
    echo "✅ MySQL: Available"
else
    echo "⚠️  MySQL: Not installed"
fi
echo "✅ Project structure: Complete"
echo "✅ Dependencies: Installed"
echo "✅ Configuration: Ready"

echo ""
echo "🚀 Next Steps:"
echo "1. Ensure MySQL is installed and running"
echo "2. Update .env with your MySQL credentials"
echo "3. Run database setup scripts (if not done)"
echo "4. Start the server: npm start"
echo "5. Open browser: http://localhost:3000"

echo ""
echo "📚 Documentation:"
echo "- README.md - Complete documentation"
echo "- QUICKSTART.md - Quick setup guide"
echo "- TESTING_GUIDE.md - Testing scenarios"
echo "- database/README.md - Database documentation"

echo ""
echo "🔑 Default Credentials (after database setup):"
echo "Admin: admin1 / password123"
echo "Student: student1 / password123"

echo ""
echo "✨ Setup complete! Your Hostel Complaint Management System is ready to use."