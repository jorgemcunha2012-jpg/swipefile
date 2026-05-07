const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jptfluaafcedmmouydob.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdGZsdWFhZmNlZG1tb3V5ZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYwMDczNzcsImV4cCI6MjAyMTU4MzM3N30.1xKxMu6F5TvEE4rQZ5Y_M2kXW1LxXp7VGXoLzEWIrjY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Creating saved_items table...');
    const { data: data1, error: error1 } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS saved_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    }).catch(() => ({ error: { message: 'RPC not available' } }));

    if (error1) {
      console.log('Note: Direct RPC not available, tables may already exist or need manual creation');
      return;
    }

    console.log('✓ Tables created successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();
