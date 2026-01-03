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
import { Wallet, LogIn, UserPlus, Github, CheckCircle2, ArrowRight, Eye, EyeOff, Play } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";



export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { skipAuth } = useAuth();
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

    const handleResetPassword = async () => {
        if (!email) {
            toast.error("Please enter your email address first");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth?type=recovery`,
            });
            if (error) throw error;
            toast.success("Password reset instructions sent to your email");
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });
            if (error) throw error;

            if (data.session) {
                toast.success("Account created successfully!");
                navigate("/");
            } else {
                toast.success("Check your email to confirm your account!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Hero Section / Login Area */}
            <main className="flex-grow flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-8 lg:gap-12 max-w-7xl mx-auto w-full">

                {/* Left Side: Brand & SEO Content */}
                <div className="flex-1 space-y-6 lg:space-y-8 text-left animate-fade-in max-w-2xl">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                            Built by Futora Group of Companies
                        </div>
                        <h1 className="text-3xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                            FutoraPay – Smart Financial Management <span className="gradient-text">Made Simple</span>
                        </h1>
                        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
                            FutoraPay is an AI-powered financial management platform designed for modern individuals & businesses. Track, plan, and grow smarter with the Futora ecosystem.
                        </p>
                        <div className="flex lg:hidden gap-3 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="rounded-full border-primary/20 bg-primary/5 text-primary text-xs"
                            >
                                Explore Features <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 rounded-xl glass-card border-none">
                            <CheckCircle2 className="w-5 h-5 text-accent mt-1" />
                            <div>
                                <h3 className="font-semibold text-foreground">Smart Insights</h3>
                                <p className="text-sm text-muted-foreground">AI-driven analysis of your spending habits.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl glass-card border-none">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-foreground">Goal Tracking</h3>
                                <p className="text-sm text-muted-foreground">Set and achieve your financial dreams.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-foreground">Trusted by users</p>
                            <p className="text-muted-foreground">Join the Futora ecosystem today.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form - Optimized for Mobile */}
                <div id="auth-form" className="w-full max-w-md animate-slide-up bg-card/95 backdrop-blur-xl p-6 lg:p-8 rounded-2xl border border-border/50 shadow-2xl">
                    {/* Mobile-Only Logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                            <Wallet className="text-primary-foreground w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">FutoraPay</span>
                    </div>
                    {/* Desktop Logo */}
                    <div className="hidden lg:flex items-center justify-center gap-2 mb-6 pt-6">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                            <Wallet className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold">FutoraPay</span>
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4 lg:mb-6 bg-secondary/50 p-1 h-auto">
                            <TabsTrigger
                                value="login"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-md py-3 text-base font-medium transition-all"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-md py-3 text-base font-medium transition-all"
                            >
                                Signup
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Card className="border-none shadow-none bg-transparent">
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
                                                className="bg-background/50 mobile-optimized-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password">Password</Label>
                                                <button
                                                    type="button"
                                                    onClick={handleResetPassword}
                                                    className="text-xs text-primary hover:underline"
                                                    disabled={loading}
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="bg-background/50 mobile-optimized-input pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12 text-base font-semibold"
                                            disabled={loading}
                                        >
                                            {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="signup">
                            <Card className="border-none shadow-none bg-transparent">
                                <CardHeader>
                                    <CardTitle>Create Account</CardTitle>
                                    <CardDescription>Start your journey with FutoraPay today</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleSignup}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="bg-background/50 mobile-optimized-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email-signup">Email</Label>
                                            <Input
                                                id="email-signup"
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-background/50 mobile-optimized-input"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password-signup">Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password-signup"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="bg-background/50 mobile-optimized-input pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col space-y-4">
                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12 text-base font-semibold"
                                            disabled={loading}
                                        >
                                            {loading ? "Creating account..." : "Sign Up"} <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                        <p className="text-xs text-center text-muted-foreground px-4">
                                            By clicking continue, you agree to our Terms of Service and Privacy Policy.
                                        </p>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-8 pt-6 border-t border-border/50">
                        <Button
                            variant="outline"
                            onClick={skipAuth}
                            className="w-full flex items-center justify-center gap-2 group hover:border-primary/50 py-6 animate-guest-glow-bounce"
                        >
                            <div className="p-1 px-2 rounded-md bg-secondary text-xs group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                GUEST MODE
                            </div>
                            <span>Skip and View Demo</span>
                            <Play className="w-3 h-3 text-muted-foreground group-hover:text-primary fill-current" />
                        </Button>
                        <p className="text-center text-xs text-muted-foreground mt-3 italic">
                            Experience the UI with mock data. No sign-up required.
                        </p>
                    </div>
                </div>
            </main>

            {/* About Section */}
            <section id="about-section" className="py-16 bg-gradient-to-b from-transparent to-secondary/20 border-t border-border/50">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
                    <h2 className="text-2xl font-bold text-foreground">About FutoraPay</h2>
                    <div className="glass-card p-8 text-lg text-muted-foreground leading-relaxed">
                        <p className="mb-4">
                            FutoraPay is a next-generation financial management platform developed by the <strong className="text-primary">Futora Group of Companies</strong>.
                        </p>
                        <p>
                            FutoraPay helps individuals, freelancers, and businesses manage finances with clarity, automation, and intelligence.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border/50 bg-background/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} <strong className="text-foreground">FutoraPay</strong>. All rights reserved.
                    </p>
                    <p>
                        A product of the <strong className="text-foreground">Futora Group of Companies</strong>.
                    </p>
                </div>
            </footer>
            {/* Sticky Mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border lg:hidden z-50 flex gap-3 safe-area-bottom animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                <Button
                    onClick={skipAuth}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12 text-sm font-bold shadow-lg animate-guest-glow-bounce"
                >
                    <Play className="w-4 h-4 mr-2" /> SKIP & VIEW DEMO
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        const element = document.getElementById("auth-form");
                        element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-4 h-12 border-primary/20 hover:bg-primary/10"
                >
                    <LogIn className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
