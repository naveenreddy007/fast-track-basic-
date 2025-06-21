@echo off
echo ========================================
echo Fast Track Wash - Database Setup
echo ========================================
echo.
echo This script will help you set up your Supabase database.
echo Please make sure you have:
echo 1. Created a Supabase project
echo 2. Have your project URL and keys ready
echo 3. Access to Supabase SQL Editor
echo.
echo IMPORTANT: Run these SQL files in your Supabase SQL Editor in this order:
echo.
echo Step 1: Run complete-schema.sql
echo   - This creates all tables, functions, and security policies
echo.
echo Step 2: Run complete-seed.sql  
echo   - This creates admin user and sample data
echo.
echo ========================================
echo SQL Files Created:
echo ========================================
dir /b *.sql
echo.
echo ========================================
echo Admin Login Credentials:
echo ========================================
echo Email: admin@fasttrackwash.com
echo Password: admin123
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Copy complete-schema.sql content
echo 2. Paste and run in Supabase SQL Editor
echo 3. Copy complete-seed.sql content  
echo 4. Paste and run in Supabase SQL Editor
echo 5. Update your .env file with Supabase credentials
echo 6. Run: npm run dev or pnpm run dev
echo.
pause