"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from 'react-icons/fc';

// Validation schema for developer form
const developerFormSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
    companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid corporate email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the Terms of Service",
    }),
    receiveLuxuryInsights: z.boolean().optional(),
});

type DeveloperFormValues = z.infer<typeof developerFormSchema>;

export default function RegisterDeveloperForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Inicijalizacija forme
    const form = useForm<DeveloperFormValues>({
        resolver: zodResolver(developerFormSchema),
        defaultValues: {
            fullName: "",
            companyName: "",
            email: "",
            password: "",
            agreeToTerms: false,
            // receiveLuxuryInsights: false,
        },
    });

    // Funkcija za slanje podataka
    const onSubmit = async (data: DeveloperFormValues) => {
        setIsLoading(true);

        try {
            // Kreiranje objekta za slanje
            const payload = {
                fullName: data.fullName,
                companyName: data.companyName,
                email: data.email,
                password: data.password,
                // receiveLuxuryInsights: data.receiveLuxuryInsights
            };

            // Definisanje API varijabli (u produkciji bi bile iz env fajla)
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";

            // Slanje zahteva
            const response = await fetch(`${baseUrl}/api/${apiVersion}/auth/signup/developer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Došlo je do greške prilikom registracije");
            }

            // Successful registration
            toast.success("Registration successful!", {
                description: "Please check your email to verify your account.",
            });

            // Redirect to confirmation page with email parameter
            router.push(`/register/confirmation?email=${encodeURIComponent(data.email)}`);
        } catch (error) {
            toast.error("Registration error", {
                description: error instanceof Error ? error.message : "An unexpected error occurred",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
        window.location.href = `${baseUrl}/api/${apiVersion}/auth/google?accountType=developer`;
    };

    return (
        <div className="mt-4">

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Puno ime */}
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Ime kompanije */}
                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your company name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Korporativna email adresa */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Corporate Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="name@your-company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Lozinka */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-md font-normal inline-block leading-[1.35]">
                                        I agree to the <Link href="/terms-of-service" target="_blank" className="hover:underline hover:text-primary transition-all">BBR Terms of Service</Link> and <Link href="/gdpr-compliance" target="_blank" className="hover:underline hover:text-primary transition-all">Privacy Policy</Link>
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="receiveLuxuryInsights"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-md font-normal inline-block">
                                        I want to receive the luxury insights
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create BBR account"
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                    >
                        <FcGoogle className="mr-2 h-4 w-4" />
                        Sign up with Google
                    </Button>
                </form>
            </Form>
            <div className="mt-4 text-center text-md flex items-center gap-2 justify-center">
                Already have an account? <Link href="/login" className="text-primary underline flex items-center gap-1 text-md">Login <ArrowRight width={16} height={16} /></Link>
            </div>
        </div>
    );
}