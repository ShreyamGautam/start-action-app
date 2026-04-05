const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  
  // 1. Check Tasks
  const { data: tasks, error: tErr, count: tCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true });
  
  if (tErr) console.error('Task Table Error:', tErr.message);
  else console.log(`Task Table: Reachable, count=${tCount}`);

  // 2. Check Sessions
  const { data: sessions, error: sErr, count: sCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true });
  
  if (sErr) console.error('Session Table Error:', sErr.message);
  else console.log(`Session Table: Reachable, count=${sCount}`);
  
  // 3. Inspect a sample row (if any) to check user_id format
  const { data: sample } = await supabase.from('sessions').select('user_id').limit(1);
  if (sample && sample.length > 0) {
    console.log('Sample UserID Format:', typeof sample[0].user_id, sample[0].user_id);
  } else {
    console.log('No data found in sessions. (RLS might be blocking or table is empty)');
  }
}

testConnection();
