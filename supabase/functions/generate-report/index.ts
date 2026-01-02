import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { report_id, format, workspace_id } = await req.json()

        // 1. Fetch Data (Using our new Analytics Views)
        // We fetch all datasets needed for the Tableau-ready export
        const { data: transactions, error: txError } = await supabaseClient
            .from('view_analytics_transactions')
            .select('*')
            .eq('workspace_id', workspace_id)

        if (txError) throw txError

        const { data: kpis, error: kpiError } = await supabaseClient
            .from('view_analytics_monthly_summary')
            .select('*')
            .eq('workspace_id', workspace_id)

        const { data: categories, error: catError } = await supabaseClient
            .from('view_analytics_category_summary')
            .select('*')
            .eq('workspace_id', workspace_id)

        // 2. Generate File Buffer based on Format
        let fileBuffer;
        let contentType;
        let filename;

        if (format === 'excel') {
            // Create Multi-sheet Workbook
            const wb = XLSX.utils.book_new();

            // Sheet 1: Summary (KPIs)
            const wsKPI = XLSX.utils.json_to_sheet(kpis || []);
            XLSX.utils.book_append_sheet(wb, wsKPI, "Monthly Summary");

            // Sheet 2: Transactions (Raw Data)
            const wsTx = XLSX.utils.json_to_sheet(transactions || []);
            XLSX.utils.book_append_sheet(wb, wsTx, "Transactions");

            // Sheet 3: Category Analysis
            const wsCat = XLSX.utils.json_to_sheet(categories || []);
            XLSX.utils.book_append_sheet(wb, wsCat, "Category Breakdown");

            // Write to buffer
            fileBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            filename = `Futora_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

        } else if (format === 'csv') {
            // For CSV, we default to the master transaction list (Tableau preferred)
            const ws = XLSX.utils.json_to_sheet(transactions || []);
            fileBuffer = XLSX.write({ Sheets: { data: ws }, SheetNames: ['data'] }, { type: 'buffer', bookType: 'csv' });
            contentType = 'text/csv';
            filename = `Futora_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
        }

        // 3. Return File Response
        return new Response(fileBuffer, {
            headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
