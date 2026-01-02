
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://tjnhfrsixigwkjebfmyl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbmhmcnNpeGlnd2tqZWJmbXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNzkzMzMsImV4cCI6MjA4Mjg1NTMzM30.ItX4BJ9mGyJ0Je_kx0PRFIJTJF2OYlNVHyFyirvlC78";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAccountsTable() {
    console.log("Testing 'accounts' table access...");

    // 1. Check if we can select from it (even if empty)
    const { data, error, count } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("❌ Error accessing 'accounts' table:");
        console.error(error);
        if (error.code === '42P01') {
            console.error("👉 DIAGNOSIS: The 'accounts' table DOES NOT EXIST. You need to run the SQL migration.");
        }
    } else {
        console.log("✅ 'accounts' table exists and is accessible.");
        console.log(`   Count: ${count}`);
    }

    // 2. Try to insert a dummy account (will fail if RLS works and we are not logged in, but we want to see THE TABLE error vs AUTH error)
    // Actually, without a user session, RLS 'Users can manage own accounts' will likely block INSERT. 
    // But if the table doesn't exist, we'll get 42P01 first.
}

testAccountsTable();
