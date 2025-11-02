// File: C:\Users\Admin\RTC\smart-warehouse-pilot\src\components\history\ProductHistoryModal.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

interface HistoryItem {
  id: number;
  robotCode?: string;
  skuCode: string;
  productName: string;
  quantity: number;
  messageId: string;
  expectedQuantity: number;
  difference: number;
  status: string;
  scannedAt: string;
  createdAt: string;
}

interface ProductHistoryResponse {
  skuCode: string;
  history: HistoryItem[];
}

interface ProductHistoryModalProps {
  warehouseCode: string;
  productCodes: string[];
  open: boolean;
  onClose: () => void;
}

const ProductHistoryModal = ({ warehouseCode, productCodes, open, onClose }: ProductHistoryModalProps) => {
  const [historyData, setHistoryData] = useState<ProductHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && productCodes.length > 0) {
      fetchProductHistory();
    }
  }, [open, productCodes]);

  const fetchProductHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      productCodes.forEach(code => params.append('productCodes', code));
      
      const data = await apiClient.get(`/${warehouseCode}/inventory/history/bySkus?${params.toString()}`);
      setHistoryData(data);
    } catch (error) {
      console.error('Failed to fetch product history:', error);
      setError('Failed to load product history');
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    const chartData: any[] = [];

    historyData.forEach(product => {
      product.history.forEach(item => {
        const timestamp = new Date(item.scannedAt).getTime();
        const date = new Date(item.scannedAt).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        // Find or create entry for this timestamp
        let entry = chartData.find(d => d.timestamp === timestamp);
        if (!entry) {
          entry = { timestamp, date };
          chartData.push(entry);
        }

        // Add data for this product
        entry[`${product.skuCode}_expected`] = item.expectedQuantity;
        entry[`${product.skuCode}_actual`] = item.quantity;
        entry[`${product.skuCode}_difference`] = item.difference;
      });
    });

    return chartData.sort((a, b) => a.timestamp - b.timestamp);
  };

  const chartData = formatChartData();

  // Generate colors for each product
  const colors = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Product History: {productCodes.join(', ')}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading product history...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-destructive">
            {error}
          </div>
        ) : historyData.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            No history data available for selected products
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quantity Trends Chart */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quantity Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {historyData.map((product, index) => (
                    <Line 
                      key={`${product.skuCode}_expected`}
                      type="monotone" 
                      dataKey={`${product.skuCode}_expected`}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                      name={`${product.skuCode} - Expected`}
                    />
                  ))}
                  {historyData.map((product, index) => (
                    <Line 
                      key={`${product.skuCode}_actual`}
                      type="monotone" 
                      dataKey={`${product.skuCode}_actual`}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                      name={`${product.skuCode} - Actual`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Difference Trends Chart */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Difference Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {historyData.map((product, index) => (
                    <Line 
                      key={`${product.skuCode}_difference`}
                      type="monotone" 
                      dataKey={`${product.skuCode}_difference`}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                      name={`${product.skuCode} - Difference`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed History Tables */}
            {historyData.map((product) => (
              <div key={product.skuCode} className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {product.skuCode} - {product.history[0]?.productName}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date/Time</th>
                        <th className="text-left p-2">Robot</th>
                        <th className="text-right p-2">Expected</th>
                        <th className="text-right p-2">Actual</th>
                        <th className="text-right p-2">Difference</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.history.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            {new Date(item.scannedAt).toLocaleDateString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="p-2">{item.robotCode || "N/A"}</td>
                          <td className="p-2 text-right">{item.expectedQuantity}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className={`p-2 text-right font-semibold ${
                            item.difference !== 0 ? 'text-destructive' : 'text-foreground'
                          }`}>
                            {item.difference > 0 ? '+' : ''}{item.difference}
                          </td>
                          <td className="p-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'OK' 
                                ? 'bg-green-100 text-green-800' 
                                : item.status === 'LOW_STOCK'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductHistoryModal;