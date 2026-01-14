import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Latest Next.js 16
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Welcome to Wellness Manage
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            A modern Next.js application built with TypeScript, Tailwind CSS,
            and shadcn/ui components
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Next.js 16</CardTitle>
              <CardDescription>
                Built with the latest App Router
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leverage React Server Components, streaming, and advanced
                routing capabilities for optimal performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📘 TypeScript</CardTitle>
              <CardDescription>Fully typed for safety</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enhanced developer experience with type safety, IntelliSense,
                and better code quality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎨 Tailwind CSS</CardTitle>
              <CardDescription>Utility-first styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rapidly build modern interfaces with a comprehensive utility
                class system and dark mode support.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧩 shadcn/ui</CardTitle>
              <CardDescription>Beautiful components</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accessible, customizable components built with Radix UI and
                Tailwind CSS.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ Performance</CardTitle>
              <CardDescription>Optimized by default</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic code splitting, image optimization, and font loading
                for blazing-fast experiences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔒 Type Safe</CardTitle>
              <CardDescription>Catch errors early</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full TypeScript support with strict mode enabled for maximum
                type safety.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Form Section */}
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Try the Components</CardTitle>
              <CardDescription>
                Example form using shadcn/ui components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
