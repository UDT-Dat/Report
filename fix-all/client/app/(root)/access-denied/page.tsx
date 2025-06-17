import {
  ArrowLeft,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: "Access Denied",
  description: "You don't have permission to access this page.",
}

export default function AccessDeniedPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 text-center mx-auto mt-20">
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <ShieldAlert className="w-64 h-64 text-destructive" />
        </div>
        <div className="relative z-10 bg-background/80 backdrop-blur-sm p-4 rounded-full">
          <Lock className="w-16 h-16 text-destructive" />
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-4">Access Denied</h1>

      <div className="max-w-md mb-8">
        <p className="text-muted-foreground text-lg mb-4">
          You don&apos;t have permission to access this page. This could be because:
        </p>
        <ul className="text-left text-muted-foreground space-y-2 mb-6">
          <li className="flex items-start">
            <span className="mr-2 mt-1">•</span>
            <span>You need to be logged in</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-1">•</span>
            <span>Your account doesn&apos;t have the required permissions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-1">•</span>
            <span>The content has been restricted by the administrator</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="default">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>

      <div className="mt-12 p-4 border rounded-lg bg-muted/50 max-w-md">
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact the site administrator or{" "}
          <Link href="/contact" className="font-medium underline underline-offset-4">
            get in touch with us
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
