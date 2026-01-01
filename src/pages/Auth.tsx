import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, LogIn, UserPlus, Github } from "lucide-react";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            toast.success("Welcome back to FutoraPay!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            toast.success("Check your email to confirm your account!");
        } catch (error: any) {
            toast.error(error.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in text-center flex-col">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent glow-effect animate-float">
                    <Wallet className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Futora<span className="gradient-text">Pay</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">Control your money. Build your future.</p>
                </div>
            </div>

            <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "200ms" }}>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1">
                        <TabsTrigger value="login" className="flex items-center gap-2">
                            <LogIn className="w-4 h-4" /> Login
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Signup
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Card className="glass-card-elevated border-none">
                            <CardHeader>
                                <CardTitle>Welcome Back</CardTitle>
                                <CardDescription>Enter your credentials to access your account</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-secondary/50 border-border focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-secondary/50 border-border focus:border-primary/50"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={loading}>
                                        {loading ? "Signing in..." : "Sign In"}
                                    </Button>
                                    <div className="relative w-full">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border"></span>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full gap-2 border-border hover:bg-secondary">
                                        <Github className="w-4 h-4" /> GitHub
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup">
                        <Card className="glass-card-elevated border-none">
                            <CardHeader>
                                <CardTitle>Create Account</CardTitle>
                                <CardDescription>Start your journey with FutoraPay today</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSignup}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-secondary/50 border-border focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-secondary/50 border-border focus:border-primary/50"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={loading}>
                                        {loading ? "Creating account..." : "Sign Up"}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        By clicking continue, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
