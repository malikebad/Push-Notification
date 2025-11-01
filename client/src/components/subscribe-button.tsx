import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  getBrowserName,
  getDeviceType,
} from "@/lib/webPush";

export function SubscribeButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  const { data: vapidKey } = useQuery({
    queryKey: ["/api/vapid-public-key"],
  });

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Check if already subscribed
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      });
    }
  }, []);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      // Request permission
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Subscribe to push
      if (!vapidKey?.publicKey) {
        throw new Error("VAPID key not available");
      }

      const subscription = await subscribeToPush(registration, vapidKey.publicKey);

      // Send subscription to server
      const subscriptionData = subscription.toJSON();
      await apiRequest("POST", "/api/subscribers", {
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys?.p256dh,
        auth: subscriptionData.keys?.auth,
        browser: getBrowserName(),
        device: getDeviceType(),
      });

      return subscription;
    },
    onSuccess: () => {
      setIsSubscribed(true);
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      toast({
        title: "Success",
        description: "You are now subscribed to notifications",
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

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
    },
    onSuccess: () => {
      setIsSubscribed(false);
      toast({
        title: "Success",
        description: "You have unsubscribed from notifications",
      });
    },
  });

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  return (
    <Button
      onClick={() => isSubscribed ? unsubscribeMutation.mutate() : subscribeMutation.mutate()}
      disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
      variant={isSubscribed ? "outline" : "default"}
      data-testid="button-subscribe"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Unsubscribe
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Subscribe to Notifications
        </>
      )}
    </Button>
  );
}
