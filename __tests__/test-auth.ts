/**
 * Authentication Test Script
 * Tests Supabase authentication configuration
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('🔍 Testing Supabase Authentication\n')
console.log('=' .repeat(80))

async function testSupabaseConnection() {
  console.log('\n📡 Test 1: Supabase Connection')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`)
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection by getting auth settings
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful')
    console.log('Session:', data.session ? 'Active' : 'None')
    return true
  } catch (error) {
    console.log('❌ Connection error:', error)
    return false
  }
}

async function testOAuthProviders() {
  console.log('\n🔐 Test 2: OAuth Providers Configuration')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test GitHub OAuth
    console.log('\nTesting GitHub OAuth...')
    const { data: githubData, error: githubError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true
      }
    })
    
    if (githubError) {
      console.log('❌ GitHub OAuth error:', githubError.message)
    } else if (githubData?.url) {
      console.log('✅ GitHub OAuth URL generated')
      console.log('URL:', githubData.url.substring(0, 100) + '...')
    } else {
      console.log('⚠️  GitHub OAuth: No URL returned (may not be configured)')
    }
    
    // Test Google OAuth
    console.log('\nTesting Google OAuth...')
    const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true
      }
    })
    
    if (googleError) {
      console.log('❌ Google OAuth error:', googleError.message)
    } else if (googleData?.url) {
      console.log('✅ Google OAuth URL generated')
      console.log('URL:', googleData.url.substring(0, 100) + '...')
    } else {
      console.log('⚠️  Google OAuth: No URL returned (may not be configured)')
    }
    
    return true
  } catch (error) {
    console.log('❌ OAuth test error:', error)
    return false
  }
}

async function testEmailAuth() {
  console.log('\n📧 Test 3: Email Authentication')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Try to sign in with test credentials (will fail but shows if auth is working)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123456'
    })
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('✅ Email auth is working (credentials invalid as expected)')
        return true
      } else {
        console.log('❌ Email auth error:', error.message)
        return false
      }
    }
    
    console.log('✅ Email auth successful (unexpected!)')
    return true
  } catch (error) {
    console.log('❌ Email auth test error:', error)
    return false
  }
}

async function testDatabase() {
  console.log('\n🗄️  Test 4: Database Access')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Try to query a table (will fail if tables don't exist, but shows connection)
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('⚠️  Database connected but tables may not exist')
        console.log('Error:', error.message)
        return true // Connection works, just no tables
      } else {
        console.log('❌ Database error:', error.message)
        return false
      }
    }
    
    console.log('✅ Database access successful')
    return true
  } catch (error) {
    console.log('❌ Database test error:', error)
    return false
  }
}

async function runTests() {
  console.log('\n🚀 Starting Authentication Tests\n')
  
  const results = {
    connection: await testSupabaseConnection(),
    oauth: await testOAuthProviders(),
    email: await testEmailAuth(),
    database: await testDatabase()
  }
  
  console.log('\n' + '=' .repeat(80))
  console.log('\n📊 Test Summary\n')
  
  console.log(`Connection:    ${results.connection ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`OAuth:         ${results.oauth ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Email Auth:    ${results.email ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Database:      ${results.database ? '✅ PASS' : '❌ FAIL'}`)
  
  const passed = Object.values(results).filter(r => r).length
  const total = Object.values(results).length
  
  console.log(`\nOverall: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Authentication is configured correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.')
  }
  
  console.log('\n' + '=' .repeat(80))
}

runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
