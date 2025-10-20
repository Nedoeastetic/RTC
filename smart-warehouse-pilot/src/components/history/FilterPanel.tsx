import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
}

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    all: true,
    ok: true,
    low: true,
    critical: true,
  });

  const handleQuickFilter = (days: number) => {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - days);
    setDateFrom(from);
    setDateTo(today);
  };

  const handleApply = () => {
    onFilterChange({
      dateFrom,
      dateTo,
      searchQuery,
      statusFilters,
    });
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchQuery("");
    setStatusFilters({ all: true, ok: true, low: true, critical: true });
    onFilterChange({});
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Фильтры</h2>

      <div className="grid grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Период</label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd.MM.yyyy", { locale: ru }) : "От"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd.MM.yyyy", { locale: ru }) : "До"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
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

          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => handleQuickFilter(0)}>
              Сегодня
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickFilter(1)}>
              Вчера
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickFilter(7)}>
              Неделя
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickFilter(30)}>
              Месяц
            </Button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Статус</label>
          <div className="space-y-2">
            {Object.entries(statusFilters).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setStatusFilters({ ...statusFilters, [key]: checked as boolean })
                  }
                />
                <label htmlFor={key} className="text-sm text-foreground capitalize cursor-pointer">
                  {key === "all" ? "Все" : key === "ok" ? "ОК" : key === "low" ? "Низкий остаток" : "Критично"}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium text-foreground">Поиск</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Артикул или название товара"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <Button onClick={handleApply} className="flex-1">
              Применить фильтры
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Сбросить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
