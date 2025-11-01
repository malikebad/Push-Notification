import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCampaignSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Campaigns() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const form = useForm({
    resolver: zodResolver(insertCampaignSchema.extend({
      title: insertCampaignSchema.shape.title,
      body: insertCampaignSchema.shape.body,
    })),
    defaultValues: {
      title: "",
      body: "",
      icon: "",
      url: "",
      badge: "",
      image: "",
      status: "draft",
      targetSegments: [],
      targetBrowsers: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return await apiRequest("POST", `/api/campaigns/${campaignId}/send`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "success";
      case "scheduled":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage notification campaigns</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Create a new push notification campaign
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Notification title" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Notification message" rows={3} data-testid="input-body" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="https://example.com" data-testid="input-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="https://example.com/icon.png" data-testid="input-icon" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                    {createMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (campaigns || []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Send className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first campaign to start sending push notifications
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {(campaigns || []).map((campaign: any) => (
            <Card key={campaign.id} data-testid={`campaign-card-${campaign.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{campaign.title}</CardTitle>
                      <Badge variant={getStatusColor(campaign.status) as any}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(campaign.status)}
                          {campaign.status}
                        </span>
                      </Badge>
                    </div>
                    <CardDescription>{campaign.body}</CardDescription>
                  </div>
                  {campaign.status === "draft" && (
                    <Button
                      onClick={() => sendMutation.mutate(campaign.id)}
                      disabled={sendMutation.isPending}
                      data-testid={`button-send-${campaign.id}`}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold tabular-nums">{campaign.totalSent || 0}</div>
                    <div className="text-sm text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold tabular-nums">{campaign.totalClicked || 0}</div>
                    <div className="text-sm text-muted-foreground">Clicked</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold tabular-nums">{campaign.totalFailed || 0}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold tabular-nums">
                      {campaign.totalSent > 0 
                        ? `${((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1)}%`
                        : "0%"
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">CTR</div>
                  </div>
                </div>
                {campaign.createdAt && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Created {format(new Date(campaign.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
