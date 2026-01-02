import { supabase } from "./supabase";

export const downloadReport = async (
    format: 'excel' | 'csv' | 'pdf',
    reportType: string,
    workspaceId: string,
    reportName: string
) => {
    try {
        console.log(`Downloading ${format} report for workspace ${workspaceId}...`);

        // PDF fallback logic for client-side handled by caller or future implementation

        const { data, error } = await supabase.functions.invoke('generate-report', {
            body: {
                workspace_id: workspaceId,
                report_id: reportType,
                format: format,
            },
        });

        if (error) throw error;

        if (data instanceof Blob) {
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return true;
        }

    } catch (err: any) {
        console.error('Download failed:', err);
        throw err;
    }
};

export const downloadReportDirect = async (
    format: 'excel' | 'csv' | 'pdf',
    workspaceId: string,
    fileName: string
) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session");

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            workspace_id: workspaceId,
            format: format,
            report_id: 'generic'
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

export const exportUserData = async () => {
    // Client-side JSON export of available profile data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const exportData = {
        user_id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        exported_at: new Date().toISOString(),
        note: "This is a raw export of your user profile data."
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `futora_data_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};
