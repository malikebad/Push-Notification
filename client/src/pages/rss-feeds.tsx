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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Rss, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRssFeedSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function RssFeeds() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: feeds, isLoading } = useQuery({
    queryKey: ["/api/rss-feeds"],
  });

  const form = useForm({
    resolver: zodResolver(insertRssFeedSchema),
    defaultValues: {
      name: "",
      url: "",
      enabled: true,
      autoSend: false,
      targetSegments: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/rss-feeds", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-feeds"] });
      toast({
        title: "Success",
        description: "RSS feed added successfully",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/rss-feeds/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-feeds"] });
      toast({
        title: "Success",
        description: "RSS feed deleted successfully",
      });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return await apiRequest("PATCH", `/api/rss-feeds/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-feeds"] });
    },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">RSS Feeds</h1>
          <p className="text-muted-foreground">Automatically trigger notifications from RSS feeds</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-feed">
              <Plus className="h-4 w-4 mr-2" />
              Add Feed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add RSS Feed</DialogTitle>
              <DialogDescription>
                Add an RSS feed to automatically create notifications
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feed Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Company Blog" data-testid="input-name" />
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
                      <FormLabel>Feed URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/feed.xml" data-testid="input-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Feed</FormLabel>
                        <FormDescription>
                          Check this feed for new items
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-enabled"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="autoSend"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-Send Notifications</FormLabel>
                        <FormDescription>
                          Automatically send notifications for new items
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-auto-send"
                        />
                      </FormControl>
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
                    {createMutation.isPending ? "Adding..." : "Add Feed"}
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
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (feeds || []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Rss className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No RSS feeds yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Add RSS feeds to automatically trigger notifications
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-first">
              <Plus className="h-4 w-4 mr-2" />
              Add Feed
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {(feeds || []).map((feed: any) => (
            <Card key={feed.id} data-testid={`feed-card-${feed.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{feed.name}</CardTitle>
                      <Badge variant={feed.enabled ? "default" : "secondary"}>
                        <span className="flex items-center gap-1">
                          {feed.enabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {feed.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </Badge>
                      {feed.autoSend && (
                        <Badge variant="outline">Auto-Send</Badge>
                      )}
                    </div>
                    <CardDescription className="truncate">{feed.url}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Switch
                      checked={feed.enabled}
                      onCheckedChange={(enabled) => toggleMutation.mutate({ id: feed.id, enabled })}
                      data-testid={`switch-toggle-${feed.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(feed.id)}
                      data-testid={`button-delete-${feed.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {feed.lastFetched && (
                  <p className="text-sm text-muted-foreground">
                    Last checked: {format(new Date(feed.lastFetched), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RSS Feed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this RSS feed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
