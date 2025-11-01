import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, Chrome, Globe, Smartphone, Monitor } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Subscribers() {
  const [search, setSearch] = useState("");
  const [browserFilter, setBrowserFilter] = useState("all");

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["/api/subscribers", { search, browser: browserFilter }],
  });

  const getBrowserIcon = (browser: string) => {
    if (browser?.toLowerCase().includes("chrome")) return <Chrome className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const getDeviceIcon = (device: string) => {
    if (device?.toLowerCase() === "mobile") return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Subscribers</h1>
        <p className="text-muted-foreground">Manage your push notification subscribers</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Subscribers</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Skeleton className="h-4 w-32 mt-1" />
                ) : (
                  `${(subscribers || []).length} total subscribers`
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={browserFilter} onValueChange={setBrowserFilter}>
                <SelectTrigger className="w-40" data-testid="select-browser">
                  <SelectValue placeholder="All Browsers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Browsers</SelectItem>
                  <SelectItem value="Chrome">Chrome</SelectItem>
                  <SelectItem value="Firefox">Firefox</SelectItem>
                  <SelectItem value="Safari">Safari</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (subscribers || []).length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No subscribers yet</h3>
              <p className="text-muted-foreground">
                Subscribers will appear here once they opt-in to notifications
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Browser</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Segments</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(subscribers || []).map((subscriber: any) => (
                    <TableRow key={subscriber.id} data-testid={`subscriber-row-${subscriber.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBrowserIcon(subscriber.browser)}
                          <span className="font-medium">{subscriber.browser || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(subscriber.device)}
                          <span>{subscriber.device || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(subscriber.segments || []).length > 0 ? (
                            subscriber.segments.map((segment: string) => (
                              <Badge key={segment} variant="outline" className="text-xs">
                                {segment}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subscriber.createdAt && format(new Date(subscriber.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subscriber.lastActive && format(new Date(subscriber.lastActive), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
