import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import FilterPanel from "@/components/history/FilterPanel";
import DataTable from "@/components/history/DataTable";
import TrendChart from "@/components/history/TrendChart";
import CSVUploadModal from "@/components/CSVUploadModal";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const History = () => {
  const navigate = useNavigate();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleFilterChange = (filters: any) => {
    console.log("Filters applied:", filters);
    toast.success("Фильтры применены");
  };

  const handleExportExcel = (selected: string[]) => {
    toast.success(`Экспорт ${selected.length} записей в Excel`);
  };

  const handleExportPDF = (selected: string[]) => {
    toast.success(`Экспорт ${selected.length} записей в PDF`);
  };

  const handleShowChart = (selected: string[]) => {
    toast.success(`График построен для ${selected.length} записей`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation onUploadClick={() => setUploadModalOpen(true)} />

      <main className="p-6 space-y-6">
        <FilterPanel onFilterChange={handleFilterChange} />

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Всего проверок за период</p>
                <p className="text-2xl font-bold text-foreground">1,247</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Уникальных товаров</p>
                <p className="text-2xl font-bold text-foreground">324</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Выявлено расхождений</p>
                <p className="text-2xl font-bold text-destructive">47</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Среднее время инвентаризации</p>
                <p className="text-2xl font-bold text-foreground">12 мин</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DataTable
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onShowChart={handleShowChart}
        />

        <TrendChart />
      </main>

      <CSVUploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </div>
  );
};

export default History;
