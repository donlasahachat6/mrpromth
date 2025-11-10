import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(url, key)

async function check() {
  const { data, error } = await supabase.from('workflows').select('id').limit(1)
  if (error) {
    console.log('❌ Workflows table does not exist:', error.message)
    process.exit(1)
  } else {
    console.log('✅ Workflows table exists')
    process.exit(0)
  }
}

check()
