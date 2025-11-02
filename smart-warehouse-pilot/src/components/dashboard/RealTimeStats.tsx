import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Package, AlertTriangle, Battery } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface RealTimeStatsProps {
  warehouseCode: string;
}

interface RealtimeStatsDTO {
  activeRobots: number;
  totalRobots: number;
  checkedToday: number;
  criticalSkus: number;
  avgBatteryPercent: number;
  activitySeries: Array<{
    ts: string;
    count: number;
  }>;
  serverTime: string;
}

const RealTimeStats = ({ warehouseCode }: RealTimeStatsProps) => {
  const [stats, setStats] = useState<RealtimeStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealtimeStats();
    const interval = setInterval(fetchRealtimeStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [warehouseCode]);

  const fetchRealtimeStats = async () => {
    try {
      const data = await apiClient.get(`/${warehouseCode}/realtime/stats`);
      setStats(data);
    } catch (error) {
      toast.error("Failed to load realtime stats");
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!stats?.activitySeries) return [];
    
    return stats.activitySeries.map(point => ({
      time: new Date(point.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: point.count
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4 h-full">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="h-48 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4 h-full">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load stats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4 text-green-500" />
              Active Robots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeRobots}/{stats.totalRobots}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="mr-2 h-4 w-4 text-blue-500" />
              Checked Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
              Critical Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.criticalSkus}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Battery className="mr-2 h-4 w-4 text-yellow-500" />
              Avg Battery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgBatteryPercent ? Math.round(stats.avgBatteryPercent) + '%' : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Robot Activity (Last Hour)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formatChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;