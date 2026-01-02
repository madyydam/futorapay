import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                    <div className="space-y-6 max-w-md animate-fade-in">
                        <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-2">
                            <AlertTriangle className="w-12 h-12" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
                                Something went wrong
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                The application encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="p-4 bg-secondary/50 rounded-lg text-left overflow-auto max-h-40 border border-border">
                                <code className="text-xs text-destructive break-all font-mono">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <Button
                                onClick={this.handleReload}
                                variant="default"
                                className="gap-2 bg-primary hover:bg-primary/90"
                            >
                                <RefreshCcw className="w-4 h-4" /> Reload Page
                            </Button>
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="gap-2 border-border"
                            >
                                <Home className="w-4 h-4" /> Go to Dashboard
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground pt-8 uppercase tracking-widest font-medium">
                            FutoraPay Error Recovery System
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
