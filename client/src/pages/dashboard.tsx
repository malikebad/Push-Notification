import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Send, MousePointerClick, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscribeButton } from "@/components/subscribe-button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/overview"],
  });

  const { data: growthData, isLoading: growthLoading } = useQuery({
    queryKey: ["/api/stats/growth"],
  });

  const { data: browserData, isLoading: browserLoading } = useQuery({
    queryKey: ["/api/stats/browsers"],
  });

  const { data: recentCampaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns", { limit: 5 }],
  });

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your notification campaigns</p>
        </div>
        <SubscribeButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold tabular-nums" data-testid="stat-subscribers">
                  {stats?.totalSubscribers?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-success">+{stats?.newSubscribers || 0}</span> this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold tabular-nums" data-testid="stat-delivered">
                  {stats?.totalDelivered?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicked</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold tabular-nums" data-testid="stat-clicked">
                  {stats?.totalClicked?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold tabular-nums" data-testid="stat-ctr">
                  {stats?.clickRate ? `${stats.clickRate.toFixed(1)}%` : "0%"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-success">+2.1%</span> from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {growthLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={growthData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="subscribers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {browserLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={browserData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(browserData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(recentCampaigns || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns yet</p>
                </div>
              ) : (
                (recentCampaigns || []).map((campaign: any) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                    data-testid={`campaign-${campaign.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{campaign.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {campaign.body}
                      </p>
                    </div>
                    <div className="flex gap-6 text-sm tabular-nums">
                      <div className="text-right">
                        <div className="font-medium">{campaign.totalSent || 0}</div>
                        <div className="text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{campaign.totalClicked || 0}</div>
                        <div className="text-muted-foreground">Clicked</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {campaign.totalSent > 0 
                            ? `${((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1)}%`
                            : "0%"
                          }
                        </div>
                        <div className="text-muted-foreground">CTR</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
