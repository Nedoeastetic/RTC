import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface WarehouseMapProps {
  warehouseCode: string;
}

interface Robot {
  id: string;
  row_pos: number;
  col_pos: number;
  battery_level: number;
  status: "idle" | "working" | "charging" | "low_battery";
}

interface Zone {
  row_pos: number;
  col_pos: number;
  zone_status: "free" | "occupied" | "maintenance";
  robot_id: string | null;
}

const WarehouseMap = ({ warehouseCode }: WarehouseMapProps) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredRobot, setHoveredRobot] = useState<Robot | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    console.log('Loading warehouse map for:', warehouseCode);
    // TODO: Replace with real API call
    // fetchData(warehouseCode);
  }, [warehouseCode]);

  const getRobotColor = (status: Robot["status"]) => {
    switch (status) {
      case "working":
        return "bg-green-500";
      case "idle":
        return "bg-blue-500";
      case "charging":
        return "bg-yellow-500";
      case "low_battery":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getZoneColor = (status: Zone["zone_status"]) => {
    switch (status) {
      case "free":
        return "bg-green-100 border-green-300";
      case "occupied":
        return "bg-yellow-100 border-yellow-300";
      case "maintenance":
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const CELL_SIZE = 80;
  const ROWS = 6;
  const COLS = 5;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Warehouse Map - {warehouseCode}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(1)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] relative overflow-auto">
        <div
          className="inline-block p-4"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          {/* Matrix Grid */}
          <div className="grid gap-2" style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`
          }}>
            {Array.from({ length: ROWS }).map((_, rowIdx) =>
              Array.from({ length: COLS }).map((_, colIdx) => {
                const zone = zones.find(z => z.row_pos === rowIdx && z.col_pos === colIdx);
                const robot = robots.find(r => r.row_pos === rowIdx && r.col_pos === colIdx);

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`border-2 rounded-lg flex items-center justify-center relative transition-all ${
                      zone ? getZoneColor(zone.zone_status) : "bg-gray-50 border-gray-200"
                    }`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  >
                    {robot && (
                      <div
                        className="relative cursor-pointer"
                        onMouseEnter={() => setHoveredRobot(robot)}
                        onMouseLeave={() => setHoveredRobot(null)}
                      >
                        <div className={`w-14 h-14 rounded-full ${getRobotColor(robot.status)} flex items-center justify-center border-4 border-white shadow-lg`}>
                          <span className="text-white font-bold text-sm">{robot.id}</span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-0.5 text-xs font-semibold border shadow-sm whitespace-nowrap">
                          {robot.battery_level}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-card border rounded-lg">
            <p className="font-semibold mb-3 text-sm">Legend:</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                <span>Free zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span>Occupied zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                <span>Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Working</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Charging</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseMap;