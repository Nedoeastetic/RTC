import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface Robot {
  id: number;
  x: number;
  y: number;
  battery: number;
  status: "active" | "low-battery" | "offline";
}

const mockRobots: Robot[] = [
  { id: 1, x: 150, y: 100, battery: 85, status: "active" },
  { id: 2, x: 350, y: 200, battery: 25, status: "low-battery" },
  { id: 3, x: 550, y: 150, battery: 92, status: "active" },
  { id: 4, x: 250, y: 300, battery: 5, status: "offline" },
];

const WarehouseMap = () => {
  const [zoom, setZoom] = useState(1);
  const [hoveredRobot, setHoveredRobot] = useState<number | null>(null);

  const getRobotColor = (status: Robot["status"]) => {
    switch (status) {
      case "active":
        return "hsl(var(--success))";
      case "low-battery":
        return "hsl(var(--warning))";
      case "offline":
        return "hsl(var(--destructive))";
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Карта склада</h2>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(1)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative bg-muted rounded-lg overflow-hidden" style={{ height: "calc(100% - 60px)" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 400"
          style={{ transform: `scale(${zoom})` }}
          className="transition-transform duration-200"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Zone labels */}
          {["A", "B", "C", "D", "E"].map((zone, i) => (
            <text
              key={zone}
              x={160 * i + 80}
              y={30}
              textAnchor="middle"
              className="fill-muted-foreground text-sm font-medium"
            >
              Зона {zone}
            </text>
          ))}

          {/* Zone areas with colors */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={160 * i}
              y={50}
              width={160}
              height={350}
              fill={i % 3 === 0 ? "hsl(var(--success)/0.1)" : i % 3 === 1 ? "hsl(var(--warning)/0.1)" : "hsl(var(--destructive)/0.1)"}
              className="transition-opacity hover:opacity-50 cursor-pointer"
            />
          ))}

          {/* Robots */}
          {mockRobots.map((robot) => (
            <g
              key={robot.id}
              transform={`translate(${robot.x}, ${robot.y})`}
              onMouseEnter={() => setHoveredRobot(robot.id)}
              onMouseLeave={() => setHoveredRobot(null)}
              className="cursor-pointer"
            >
              <circle r="15" fill={getRobotColor(robot.status)} className="transition-all" />
              <text
                textAnchor="middle"
                y="5"
                className="fill-white text-xs font-bold pointer-events-none"
              >
                {robot.id}
              </text>

              {hoveredRobot === robot.id && (
                <g transform="translate(20, -30)">
                  <rect
                    width="120"
                    height="60"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    rx="4"
                  />
                  <text x="10" y="20" className="fill-foreground text-xs">
                    Робот #{robot.id}
                  </text>
                  <text x="10" y="38" className="fill-muted-foreground text-xs">
                    Батарея: {robot.battery}%
                  </text>
                  <text x="10" y="52" className="fill-muted-foreground text-xs">
                    {robot.status === "active" ? "Активен" : robot.status === "low-battery" ? "Низкий заряд" : "Offline"}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default WarehouseMap;
