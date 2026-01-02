import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Notification[];
        },
    });

    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const deleteNotification = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Notification deleted");
        },
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        deleteNotification
    };
}
