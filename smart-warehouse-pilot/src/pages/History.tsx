// File: C:\Users\Admin\RTC\smart-warehouse-pilot\src\pages\History.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import FilterPanel from "@/components/history/FilterPanel";
import DataTable from "@/components/history/DataTable";
import SelectedProductsTrendChart from "@/components/history/SelectedProductsTrendChart";
import CSVUploadModal from "@/components/CSVUploadModal";
import StockDepletionForecast from "@/components/dashboard/StockDepletionForecast";
import ReplenishmentNeeds from "@/components/dashboard/ReplenishmentNeeds";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface HistorySummaryDTO {
  total: number;
  uniqueProducts: number;
  discrepancies: number;
  avgZoneScanMinutes: number;
}

const History = () => {
  const navigate = useNavigate();
  const { warehouseCode } = useParams();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [summary, setSummary] = useState<HistorySummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    if (warehouseCode) {
      fetchSummary();
    }
  }, [navigate, warehouseCode]);

  const fetchSummary = async () => {
    try {
      const data = await apiClient.get(`/${warehouseCode}/inventory/history/summary`);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load history summary:', error);
      toast.error("Failed to load history summary");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    toast.success("Filters applied");
  };

  const handleExportExcel = (selected: string[]) => {
    toast.success(`Export ${selected.length} records to Excel`);
  };

  const handleExportPDF = (selected: string[]) => {
    toast.success(`Export ${selected.length} records to PDF`);
  };

  const handleShowChart = (selected: string[]) => {
    if (selected.length === 0) {
      toast.info("Please select products to view chart");
    } else {
      setSelectedProducts(selected);
      toast.success(`Showing chart for ${selected.length} products`);
    }
  };

  const handleSelectionChange = (selected: string[]) => {
    setSelectedProducts(selected);
  };

  if (!warehouseCode) {
    return <div>No warehouse selected</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header warehouseCode={warehouseCode} />
      <Navigation warehouseCode={warehouseCode} onUploadClick={() => setUploadModalOpen(true)} />

      <main className="p-6 space-y-6">
        <FilterPanel warehouseCode={warehouseCode} onFilterChange={handleFilterChange} />

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="grid grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : summary ? (
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total scans in period</p>
                  <p className="text-2xl font-bold text-foreground">{summary.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unique products</p>
                  <p className="text-2xl font-bold text-foreground">{summary.uniqueProducts}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discrepancies found</p>
                  <p className="text-2xl font-bold text-destructive">{summary.discrepancies}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg scan time</p>
                  <p className="text-2xl font-bold text-foreground">
                    {summary.avgZoneScanMinutes ? `${Math.round(summary.avgZoneScanMinutes)} min` : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Failed to load summary</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <StockDepletionForecast warehouseCode={warehouseCode} />
          <ReplenishmentNeeds warehouseCode={warehouseCode} />
        </div>

        <DataTable
          warehouseCode={warehouseCode}
          filters={filters}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onShowChart={handleShowChart}
          onSelectionChange={handleSelectionChange}
          selectedProducts={selectedProducts}
        />

        {/* График остатков по выбранным товарам */}
        <SelectedProductsTrendChart 
          warehouseCode={warehouseCode}
          selectedProducts={selectedProducts}
        />
      </main>

      <CSVUploadModal 
        open={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        warehouseCode={warehouseCode}
      />
    </div>
  );
};

export default History;