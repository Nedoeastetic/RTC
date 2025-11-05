import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

interface FilterPanelProps {
  warehouseCode: string;
  onFilterChange: (filters: any) => void;
}

interface Robot {
  id: number;
  code: string;
  status: string;
  batteryLevel: number;
  currentZone: string;
  currentRow: number;
  currentShelf: number;
  warehouseId: number;
  lastUpdate: string;
}

const FilterPanel = ({ warehouseCode, onFilterChange }: FilterPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [robotCode, setRobotCode] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loadingRobots, setLoadingRobots] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = [
    "network",
    "electronics",
    "cables",
    "accessories",
    "components"
  ];

  useEffect(() => {
    if (warehouseCode) {
      fetchRobots();
    }
  }, [warehouseCode]);

  const fetchRobots = async () => {
    setLoadingRobots(true);
    try {
      const data = await apiClient.get(`/robots/warehouse/${warehouseCode}`);
      setRobots(data);
    } catch (error) {
      console.error('Failed to fetch robots:', error);
    } finally {
      setLoadingRobots(false);
    }
  };

  const handleApplyFilters = () => {
    const filters: any = {};

    if (searchQuery.trim()) filters.q = searchQuery.trim();
    if (status !== "all") filters.status = status;
    if (robotCode !== "all") filters.robotCode = robotCode;
    if (categories.length > 0) filters.categories = categories;

    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatus("all");
    setRobotCode("all");
    setCategories([]);
    onFilterChange({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleCategoryChange = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "OK", label: "OK" },
    { value: "LOW_STOCK", label: "Low Stock" },
    { value: "CRITICAL", label: "Critical" },
  ];

  const hasActiveFilters = searchQuery || status !== "all" || robotCode !== "all" || categories.length > 0;

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search by product code, product name, or robot code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-12 h-14 text-lg"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Enter to search
            </span>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap pt-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Robot</label>
            <Select value={robotCode} onValueChange={setRobotCode} disabled={loadingRobots}>
              <SelectTrigger>
                <SelectValue placeholder={loadingRobots ? "Loading robots..." : "Select robot"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All robots</SelectItem>
                {robots.map(robot => (
                  <SelectItem key={robot.id} value={robot.code}>{robot.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(category => (
                <Badge
                  key={category}
                  variant={categories.includes(category) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    categories.includes(category) 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleApplyFilters} size="lg">
              Apply filters
            </Button>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline" size="lg">
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;