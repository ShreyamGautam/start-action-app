const { createClient } = require('@supabase/supabase-js');

// Hardcoded for a one-time diagnostic test
const supabaseUrl = 'https://lbflefvaeabufwbxriqh.supabase.co';
const supabaseAnonKey = 'sb_publishable_tG-i7TAcvBVo_ilw887n5Q_7sVepwIy';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('--- SUPABASE DIAGNOSTIC ---');
  
  try {
    // 1. Check Sessions
    const { data: sData, error: sErr, count: sCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact' });
    
    if (sErr) {
      console.error('Session Table Error:', sErr.message, sErr.code);
    } else {
      console.log(`Session Table: Found ${sCount} total rows.`);
      if (sData && sData.length > 0) {
        console.log('First Row UserID:', sData[0].user_id);
        console.log('First Row Type:', typeof sData[0].user_id);
      }
    }

    // 2. Check Tasks
    const { data: tData, error: tErr, count: tCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' });
    
    if (tErr) console.error('Task Table Error:', tErr.message);
    else console.log(`Task Table: Found ${tCount} total rows.`);

  } catch (err) {
    console.error('Crash:', err.message);
  }
}

testConnection();
