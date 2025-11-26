import { Link } from "wouter";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-go-home">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="gap-2 w-full sm:w-auto" data-testid="button-go-dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
