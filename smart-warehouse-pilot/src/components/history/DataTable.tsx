import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, BarChart3, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DataRow {
  id: string;
  scan_datetime: string;
  robot_id: string;
  zone: string;
  article: string;
  product_name: string;
  expected_quantity: number;
  actual_quantity: number;
  difference: number;
  status: string;
}

interface DataTableProps {
  onExportExcel: (selected: string[]) => void;
  onExportPDF: (selected: string[]) => void;
  onShowChart: (selected: string[]) => void;
}

const DataTable = ({ onExportExcel, onExportPDF, onShowChart }: DataTableProps) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof DataRow | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: scans, error } = await supabase
      .from("inventory_scans")
      .select("*")
      .order("scan_datetime", { ascending: false });

    if (!error && scans) {
      setData(scans as DataRow[]);
    }
    setLoading(false);
  };

  const handleSort = (column: keyof DataRow) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map(row => row.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "совпадает" ? "default" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const SortIcon = ({ column }: { column: keyof DataRow }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const direction = sortDirection === "asc" ? 1 : -1;
    return aVal > bVal ? direction : -direction;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(data.length / rowsPerPage);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportExcel(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportPDF(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowChart(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            График
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Выбрано: {selectedRows.length} из {data.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead onClick={() => handleSort("scan_datetime")} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Дата/Время
                  <SortIcon column="scan_datetime" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("robot_id")} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Робот
                  <SortIcon column="robot_id" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("zone")} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Зона
                  <SortIcon column="zone" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("article")} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Артикул
                  <SortIcon column="article" />
                </div>
              </TableHead>
              <TableHead>Название</TableHead>
              <TableHead className="text-right">Ожид.</TableHead>
              <TableHead className="text-right">Факт.</TableHead>
              <TableHead className="text-right">Разница</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onCheckedChange={() => handleSelectRow(row.id)}
                  />
                </TableCell>
                <TableCell>{format(new Date(row.scan_datetime), "dd.MM.yyyy HH:mm")}</TableCell>
                <TableCell>{row.robot_id}</TableCell>
                <TableCell>{row.zone}</TableCell>
                <TableCell className="font-mono">{row.article}</TableCell>
                <TableCell>{row.product_name}</TableCell>
                <TableCell className="text-right">{row.expected_quantity}</TableCell>
                <TableCell className="text-right">{row.actual_quantity}</TableCell>
                <TableCell className={`text-right font-semibold ${row.difference !== 0 ? 'text-destructive' : ''}`}>
                  {row.difference > 0 ? '+' : ''}{row.difference}
                </TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Страница {currentPage} из {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;