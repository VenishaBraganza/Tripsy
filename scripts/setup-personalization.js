#!/usr/bin/env node

/**
 * Tripsy Personalization Setup Script
 * 
 * This script helps set up the personalization system by:
 * 1. Checking database connection
 * 2. Creating the personalization table
 * 3. Verifying the setup
 * 4. Running basic tests
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Required variables:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConnection() {
  console.log('🔍 Checking database connection...')
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error) throw error
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function checkTableExists() {
  console.log('🔍 Checking if user_personalization table exists...')
  try {
    const { data, error } = await supabase
      .from('user_personalization')
      .select('id')
      .limit(1)
    
    if (error && error.code === '42P01') {
      console.log('⚠️  user_personalization table does not exist')
      return false
    }
    
    console.log('✅ user_personalization table exists')
    return true
  } catch (error) {
    console.log('⚠️  user_personalization table does not exist')
    return false
  }
}

async function createTable() {
  console.log('🔨 Creating user_personalization table...')
  
  const createTableSQL = `
    -- Add user_personalization table for detailed travel preferences
    CREATE TABLE IF NOT EXISTS user_personalization (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      
      -- Basic Travel Information
      preferred_region TEXT DEFAULT 'south-karnataka',
      trip_duration TEXT DEFAULT '4-7-days' CHECK (trip_duration IN ('1-3-days', '4-7-days', '1-week-plus')),
      number_of_travelers INTEGER DEFAULT 2,
      travel_type TEXT DEFAULT 'couple' CHECK (travel_type IN ('solo', 'family', 'friends', 'couple')),
      
      -- Interest Selection (Multi-select)
      interests TEXT[] DEFAULT '{}',
      
      -- Budget & Travel Style
      budget_preference TEXT DEFAULT 'medium' CHECK (budget_preference IN ('budget', 'medium', 'premium')),
      travel_pace TEXT DEFAULT 'balanced' CHECK (travel_pace IN ('relaxed', 'balanced', 'packed')),
      
      -- Safety & Accessibility Preferences
      safety_preferences TEXT[] DEFAULT '{}',
      
      -- Optional Personalization Enhancements
      accommodation_preference TEXT DEFAULT 'any' CHECK (accommodation_preference IN ('hotel', 'homestay', 'any')),
      food_preference TEXT DEFAULT 'no-preference' CHECK (food_preference IN ('vegetarian', 'non-vegetarian', 'no-preference')),
      
      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      UNIQUE(user_id)
    );

    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_user_personalization_user_id ON user_personalization(user_id);

    -- Enable RLS
    ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

    -- RLS Policies
    DROP POLICY IF EXISTS "Users can view own personalization" ON user_personalization;
    DROP POLICY IF EXISTS "Users can create own personalization" ON user_personalization;
    DROP POLICY IF EXISTS "Users can update own personalization" ON user_personalization;
    
    CREATE POLICY "Users can view own personalization" ON user_personalization FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create own personalization" ON user_personalization FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own personalization" ON user_personalization FOR UPDATE USING (auth.uid() = user_id);
  `

  try {
    // Split the SQL into individual statements and execute them
    const statements = createTableSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    for (const statement of statements) {
      if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || 
          statement.includes('ALTER TABLE') || statement.includes('CREATE POLICY') || 
          statement.includes('DROP POLICY')) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error && !error.message.includes('already exists')) {
          console.warn(`Warning executing: ${statement.substring(0, 50)}...`)
          console.warn(`Error: ${error.message}`)
        }
      }
    }

    console.log('✅ Table creation completed')
    return true
  } catch (error) {
    console.error('❌ Failed to create table:', error.message)
    console.log('\n📝 Manual Setup Required:')
    console.log('Please run the SQL script manually in your Supabase dashboard:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the contents of scripts/add-personalization-table.sql')
    return false
  }
}

async function verifySetup() {
  console.log('🔍 Verifying setup...')
  
  try {
    // Check if we can query the table
    const { data, error } = await supabase
      .from('user_personalization')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Setup verification successful')
    return true
  } catch (error) {
    console.error('❌ Setup verification failed:', error.message)
    return false
  }
}

async function showNextSteps() {
  console.log('\n🎉 Personalization System Setup Complete!')
  console.log('\n📋 Next Steps:')
  console.log('1. Start your development server: npm run dev')
  console.log('2. Visit http://localhost:3000/test-personalization to test the system')
  console.log('3. Sign up as a new user to test the onboarding flow')
  console.log('4. Complete the personalization form')
  console.log('5. Verify data is saved in the database')
  
  console.log('\n🔗 Key URLs:')
  console.log('- Test Page: http://localhost:3000/test-personalization')
  console.log('- Personalization: http://localhost:3000/personalization')
  console.log('- Dashboard: http://localhost:3000/dashboard')
  
  console.log('\n📚 Documentation:')
  console.log('- Setup Guide: ITINERARY_PERSONALIZATION_GUIDE.md')
  console.log('- API Endpoints: /api/personalization')
  console.log('- Database Migration: scripts/add-personalization-table.sql')
}

async function main() {
  console.log('🚀 Tripsy Personalization Setup\n')
  
  // Step 1: Check connection
  const connected = await checkConnection()
  if (!connected) {
    process.exit(1)
  }
  
  // Step 2: Check if table exists
  const tableExists = await checkTableExists()
  
  // Step 3: Create table if needed
  if (!tableExists) {
    const created = await createTable()
    if (!created) {
      process.exit(1)
    }
  }
  
  // Step 4: Verify setup
  const verified = await verifySetup()
  if (!verified) {
    process.exit(1)
  }
  
  // Step 5: Show next steps
  await showNextSteps()
}

main().catch(console.error)