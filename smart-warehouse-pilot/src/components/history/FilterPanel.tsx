import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
}

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [robotId, setRobotId] = useState<string>("all");

  const handleApplyFilters = () => {
    onFilterChange({
      dateFrom,
      dateTo,
      searchQuery,
      status: status !== "all" ? status : undefined,
      robotId: robotId !== "all" ? robotId : undefined,
    });
  };

  const quickFilters = [
    { label: "Все", value: "all" },
    { label: "Расхождения", value: "расхождение" },
    { label: "Совпадает", value: "совпадает" },
  ];

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      {/* Main Search */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск по артикулу, названию товара, зоне..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Быстрые фильтры:
          </span>
          {quickFilters.map((filter) => (
            <Badge
              key={filter.value}
              variant={status === filter.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="flex gap-4 flex-wrap pt-4 border-t">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Робот</label>
            <Select value={robotId} onValueChange={setRobotId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите робота" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роботы</SelectItem>
                <SelectItem value="R1">R1</SelectItem>
                <SelectItem value="R2">R2</SelectItem>
                <SelectItem value="R3">R3</SelectItem>
                <SelectItem value="R4">R4</SelectItem>
                <SelectItem value="R5">R5</SelectItem>
                <SelectItem value="R6">R6</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Дата от</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Дата до</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end">
            <Button onClick={handleApplyFilters} size="lg">
              Применить фильтры
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;