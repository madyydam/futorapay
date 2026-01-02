import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        // Fallback timeout to ensure we don't stay in loading state forever
        const timeoutId = setTimeout(() => {
            if (isMounted) {
                console.warn("Auth initialization timed out. Proceeding to fallback state.");
                setLoading(false);
            }
        }, 5000);

        // Check active sessions and sets the user
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                if (isMounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                    clearTimeout(timeoutId);
                    handleRedirect(session);
                }
            })
            .catch((error) => {
                console.error("Error getting session:", error);
                if (isMounted) {
                    setLoading(false);
                    clearTimeout(timeoutId);
                }
            });

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (isMounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                    handleRedirect(session);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    const handleRedirect = (session: Session | null) => {
        const isAuthPage = location.pathname === "/auth";

        if (!session && !isAuthPage) {
            navigate("/auth");
        } else if (session && isAuthPage) {
            navigate("/");
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success("Successfully signed out");
            navigate("/auth");
        } catch (error: any) {
            toast.error(error.message || "Error signing out");
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {loading ? (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                    <div className="space-y-6 max-w-md animate-fade-in">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse glow-effect flex items-center justify-center">
                                <Wallet className="w-8 h-8 text-primary-foreground animate-bounce" />
                            </div>
                            <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-primary/20 animate-ping" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-foreground">Initialising FutoraPay</h2>
                            <p className="text-muted-foreground animate-pulse text-sm">Securing your financial dashboard...</p>
                        </div>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
