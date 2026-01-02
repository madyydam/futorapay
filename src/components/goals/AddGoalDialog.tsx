import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGoals } from "@/hooks/useGoals";
import { Loader2, Plus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    target_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Target amount must be greater than 0"),
    deadline: z.string().min(1, "Deadline is required"),
    icon: z.string().min(1, "Icon is required"),
    color: z.string().min(1, "Color is required"),
});

const ICONS = ["Target", "Car", "Home", "Plane", "Smartphone", "GraduationCap", "Gem"];
const COLORS = ["text-primary", "text-accent", "text-warning", "text-success", "text-purple-400", "text-pink-400"];

export function AddGoalDialog() {
    const [open, setOpen] = useState(false);
    const { addGoal } = useGoals();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            target_amount: "",
            deadline: "",
            icon: "Target",
            color: "text-primary",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await addGoal.mutateAsync({
                name: values.name,
                target_amount: Number(values.target_amount),
                deadline: values.deadline,
                icon: values.icon,
                color: values.color,
            });
            form.reset();
            setOpen(false);
        } catch (error) {
            console.error("Failed to add goal", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    New Goal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card-elevated border-border">
                <DialogHeader>
                    <DialogTitle>Create Savings Goal</DialogTitle>
                    <DialogDescription>
                        Set a target and save towards your dreams.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. New Macbook" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="target_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="50000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="deadline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deadline</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ICONS.map((icon) => (
                                                    <SelectItem key={icon} value={icon}>
                                                        {icon}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color Theme</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="text-primary">Blue</SelectItem>
                                                <SelectItem value="text-accent">Green</SelectItem>
                                                <SelectItem value="text-warning">Orange</SelectItem>
                                                <SelectItem value="text-success">Teal</SelectItem>
                                                <SelectItem value="text-purple-400">Purple</SelectItem>
                                                <SelectItem value="text-pink-400">Pink</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={addGoal.isPending}>
                                {addGoal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Goal
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
