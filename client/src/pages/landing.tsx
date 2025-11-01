import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Users, Send, BarChart3, Rss, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">PushNotify</span>
          </div>
          <Button
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Comprehensive Push Notification Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Engage up to 20,000 subscribers across Chrome, Firefox, and Safari with advanced campaign management, scheduling, and targeting
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Multi-Browser Support</CardTitle>
              <CardDescription>
                Send notifications to Chrome, Firefox, and Safari users on desktop and mobile
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Subscriber Management</CardTitle>
              <CardDescription>
                Organize and segment up to 20,000 subscribers with advanced targeting
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Campaign Scheduling</CardTitle>
              <CardDescription>
                Schedule notifications with timezone-based delivery and recurring campaigns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Track delivery stats, click-through rates, and subscriber growth
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Rss className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>RSS Integration</CardTitle>
              <CardDescription>
                Automatically trigger notifications from RSS feed updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Support for up to 15 team members with role-based access
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
