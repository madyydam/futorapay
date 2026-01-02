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
import { Wallet, LogIn, UserPlus, Github, CheckCircle2, ArrowRight } from "lucide-react";



export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
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

                {/* Left Side: Brand & SEO Content - HIDDEN ON MOBILE */}
                <div className="hidden lg:block flex-1 space-y-8 text-left animate-fade-in max-w-2xl">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                            Built by Futora Group of Companies
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                            FutoraPay – Smart Financial Management <span className="gradient-text">Made Simple</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                            FutoraPay is an AI-powered financial management platform designed for modern individuals & businesses. Track, plan, and grow smarter with the Futora ecosystem.
                        </p>
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
                <div className="w-full max-w-md animate-slide-up bg-card/95 backdrop-blur-xl p-6 lg:p-8 rounded-2xl border border-border/50 shadow-2xl">
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
                                                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="bg-background/50 mobile-optimized-input"
                                            />
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
                                            <Input
                                                id="password-signup"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="bg-background/50 mobile-optimized-input"
                                            />
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
                </div>
            </main>

            {/* About Section */}
            <section className="py-16 bg-gradient-to-b from-transparent to-secondary/20 border-t border-border/50">
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
        </div>
    );
}
