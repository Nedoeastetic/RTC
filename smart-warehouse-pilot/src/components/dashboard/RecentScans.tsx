import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface Scan {
  id: string;
  time: string;
  robotId: number;
  zone: string;
  product: string;
  article: string;
  quantity: number;
  status: "ok" | "low" | "critical";
}

const mockScans: Scan[] = [
  {
    id: "1",
    time: new Date().toLocaleTimeString("ru-RU"),
    robotId: 3,
    zone: "A-12",
    product: "Роутер RT-AC68U",
    article: "TEL-4567",
    quantity: 45,
    status: "ok",
  },
  {
    id: "2",
    time: new Date(Date.now() - 5000).toLocaleTimeString("ru-RU"),
    robotId: 1,
    zone: "B-08",
    product: "Модем DSL-2640U",
    article: "TEL-8901",
    quantity: 12,
    status: "low",
  },
  {
    id: "3",
    time: new Date(Date.now() - 10000).toLocaleTimeString("ru-RU"),
    robotId: 2,
    zone: "C-15",
    product: "Кабель UTP Cat.5e",
    article: "CAB-2345",
    quantity: 3,
    status: "critical",
  },
];

const RecentScans = () => {
  const [scans, setScans] = useState<Scan[]>(mockScans);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const products = [
        "Роутер RT-AC68U",
        "Модем DSL-2640U",
        "Кабель UTP Cat.5e",
        "Коммутатор GS108E",
        "Точка доступа UAP-AC-LR",
      ];
      const articles = ["TEL-4567", "TEL-8901", "CAB-2345", "NET-1122", "WIR-9988"];
      const zones = ["A-12", "B-08", "C-15", "D-03", "E-20"];
      const statuses: Scan["status"][] = ["ok", "ok", "ok", "low", "critical"];

      const newScan: Scan = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString("ru-RU"),
        robotId: Math.floor(Math.random() * 4) + 1,
        zone: zones[Math.floor(Math.random() * zones.length)],
        product: products[Math.floor(Math.random() * products.length)],
        article: articles[Math.floor(Math.random() * articles.length)],
        quantity: Math.floor(Math.random() * 50) + 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };

      setScans((prev) => [newScan, ...prev.slice(0, 19)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (scrollRef.current && !paused) {
      scrollRef.current.scrollTop = 0;
    }
  }, [scans, paused]);

  const getStatusBadge = (status: Scan["status"]) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-success text-success-foreground">ОК</Badge>;
      case "low":
        return <Badge className="bg-warning text-warning-foreground">Низкий остаток</Badge>;
      case "critical":
        return <Badge className="bg-destructive text-destructive-foreground">Критично</Badge>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Последние сканирования</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto space-y-2 pr-2">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="border border-border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs text-muted-foreground">{scan.time}</div>
                {getStatusBadge(scan.status)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Робот #{scan.robotId}</span>
                  <span className="text-xs font-medium text-primary">{scan.zone}</span>
                </div>
                <div className="text-sm font-medium text-foreground">{scan.product}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{scan.article}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {scan.quantity} шт.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentScans;
