"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// 1. Define your validation schema
const LoginSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const LoginFetcher = async (url: string, { arg }: { arg: z.infer<typeof LoginSchema> }) => {
  const response = await axios.post(url, arg, { withCredentials: true });

  return response.data;
};

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // 2. Define your form
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    trigger,
    isMutating,
    error: swrError,
  } = useSWRMutation(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, LoginFetcher);

  // 3. Define a submit handler
  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    try {
      await trigger(values);
      // Use Sonner for success
      toast.success("Login Successful", {
        description: "Redirecting you to the profile page...",
      });

      // Brief delay so user can see the success toast
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error("Login Failed", {
        description: message,
      });
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Common class for spacious input with thinner focus ring
  const inputStyles =
    "pl-11 pr-4 h-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary/40 border-input";

  const background =
    "h-screen w-full bg-gradient-to-br from-sky-100 via-sky-200 to-blue-200 flex items-center justify-center";

  return (
    <div className={background}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center"> Log In</CardTitle>
          <CardDescription className="text-center">Enter your credentials to log in</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="m@example.com" className={inputStyles} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className={inputStyles}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isMutating} // Disable button while loading
              >
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Log In account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </Form>
          <p className=" text-center pt-3.5">
            Don't have an account?{" "}
            <Link href={"/auth/register"} className="text-blue-700">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
