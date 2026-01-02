
import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75"></div>
                    <div className="relative rounded-full bg-background p-4 shadow-xl ring-1 ring-border">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Loading amazing things...</p>
            </div>
        </div>
    );
}
