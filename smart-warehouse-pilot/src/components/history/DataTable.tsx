import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DataRow {
  id: string;
  datetime: string;
  robotId: number;
  zone: string;
  article: string;
  productName: string;
  expected: number;
  actual: number;
  difference: number;
  status: "ok" | "low" | "critical";
}

const mockData: DataRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `row-${i}`,
  datetime: new Date(Date.now() - i * 3600000).toLocaleString("ru-RU"),
  robotId: Math.floor(Math.random() * 4) + 1,
  zone: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${String(Math.floor(Math.random() * 50) + 1).padStart(2, "0")}`,
  article: `TEL-${Math.floor(Math.random() * 9000) + 1000}`,
  productName: ["Роутер RT-AC68U", "Модем DSL-2640U", "Кабель UTP Cat.5e", "Коммутатор GS108E"][Math.floor(Math.random() * 4)],
  expected: Math.floor(Math.random() * 100) + 10,
  actual: Math.floor(Math.random() * 100),
  difference: Math.floor(Math.random() * 20) - 10,
  status: ["ok", "ok", "ok", "low", "critical"][Math.floor(Math.random() * 5)] as DataRow["status"],
}));

interface DataTableProps {
  onExportExcel: (selected: string[]) => void;
  onExportPDF: (selected: string[]) => void;
  onShowChart: (selected: string[]) => void;
}

const DataTable = ({ onExportExcel, onExportPDF, onShowChart }: DataTableProps) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(mockData.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const getStatusBadge = (status: DataRow["status"]) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-success text-success-foreground">ОК</Badge>;
      case "low":
        return <Badge className="bg-warning text-warning-foreground">Низкий</Badge>;
      case "critical":
        return <Badge className="bg-destructive text-destructive-foreground">Критично</Badge>;
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = mockData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(mockData.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length === mockData.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("datetime")}>
                  Дата и время <SortIcon column="datetime" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("robotId")}>
                  ID робота <SortIcon column="robotId" />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("zone")}>
                  Зона <SortIcon column="zone" />
                </TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Название товара</TableHead>
                <TableHead className="text-right">Ожидаемое</TableHead>
                <TableHead className="text-right">Фактическое</TableHead>
                <TableHead className="text-right">Расхождение</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="text-sm">{row.datetime}</TableCell>
                  <TableCell className="text-sm">#{row.robotId}</TableCell>
                  <TableCell className="text-sm font-medium">{row.zone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.article}</TableCell>
                  <TableCell className="text-sm">{row.productName}</TableCell>
                  <TableCell className="text-right text-sm">{row.expected}</TableCell>
                  <TableCell className="text-right text-sm">{row.actual}</TableCell>
                  <TableCell className="text-right text-sm">
                    <span className={row.difference >= 0 ? "text-success" : "text-destructive"}>
                      {row.difference > 0 ? "+" : ""}{row.difference}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportExcel(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Экспорт в Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportPDF(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Экспорт в PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowChart(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Построить график
          </Button>
          <span className="text-sm text-muted-foreground ml-4">
            Выбрано: {selectedRows.length} из {mockData.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Вперёд
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
