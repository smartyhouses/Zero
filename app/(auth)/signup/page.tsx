"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signUp, useSession, authClient, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  console.log(session);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      signUp.email({
        email,
        password,
        name,
      });
      toast.success("Account created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-2 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-1 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Create your Mail0 account</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Create an account to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 px-9 sm:px-16">
          <div className="mt-2 flex flex-col gap-2">
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase text-gray-600 dark:text-zinc-400"
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tyler Durden"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-black dark:border-zinc-600 dark:bg-black dark:text-white sm:text-sm"
              />
            </div>
            <label
              htmlFor="email"
              className="mt-2 block text-xs uppercase text-gray-600 dark:text-zinc-400"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tylerdurden@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-black dark:border-zinc-600 dark:bg-black dark:text-white sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase text-gray-600 dark:text-zinc-400"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-black dark:border-zinc-600 dark:bg-black dark:text-white sm:text-sm"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Continue
          </Button>
        </form>
        <div className="mx-auto mt-2 max-w-sm text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline-primary underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline-primary underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </div>
        {session && (
          <div>
            <p>User ID: {session.user.id}</p>
            <p>Email: {session.user.email}</p>
            <p>Name: {session.user.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
