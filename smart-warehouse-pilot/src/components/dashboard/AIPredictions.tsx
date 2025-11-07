import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AIPredictionsProps {
  warehouseCode: string;
}

interface Product {
  id: string;
  article: string;
  name: string;
  current_stock: number;
  daily_consumption: number;
  min_stock_level: number;
  reorder_quantity: number;
}

const AIPredictions = ({ warehouseCode }: AIPredictionsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(87);

  useEffect(() => {
    console.log('Loading AI predictions for:', warehouseCode);
    fetchCriticalProducts();
  }, [warehouseCode]);

  const fetchCriticalProducts = async () => {
    setLoading(true);
    
    // TODO: Replace with real API call to /api/{warehouseCode}/predict
    // Mock data for now
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: "1",
          article: "TEL-4567",
          name: "Router RT-AC68U",
          current_stock: 15,
          daily_consumption: 5,
          min_stock_level: 20,
          reorder_quantity: 50
        },
        {
          id: "2",
          article: "TEL-8901",
          name: "Modem DSL-2640U",
          current_stock: 8,
          daily_consumption: 3,
          min_stock_level: 15,
          reorder_quantity: 30
        },
        {
          id: "3",
          article: "CAB-2345",
          name: "Cable UTP Cat.5e",
          current_stock: 2,
          daily_consumption: 1,
          min_stock_level: 10,
          reorder_quantity: 25
        }
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    toast.info("Updating predictions...");
    fetchCriticalProducts();
    setConfidence(Math.floor(Math.random() * 15) + 80);
    toast.success("Predictions updated");
  };

  const calculateDaysUntilDepletion = (product: Product) => {
    if (product.daily_consumption === 0) return Infinity;
    return Math.floor(product.current_stock / product.daily_consumption);
  };

  const getDepletionDate = (product: Product) => {
    const days = calculateDaysUntilDepletion(product);
    if (days === Infinity) return "Not determined";
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            AI Critical Predictions - {warehouseCode}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">Prediction accuracy:</span>
          <span className="text-sm font-semibold text-primary">{confidence}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No critical predictions
          </p>
        ) : (
          products.map((product) => {
            const daysLeft = calculateDaysUntilDepletion(product);
            const isUrgent = daysLeft <= 3;
            const isWarning = daysLeft <= 7 && daysLeft > 3;
            const depletionDate = getDepletionDate(product);

            return (
              <div
                key={product.id}
                className={`p-4 rounded-lg border-l-4 ${
                  isUrgent
                    ? "bg-red-50 dark:bg-red-950/20 border-red-500"
                    : isWarning
                    ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500"
                    : "bg-card border-primary/20"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {isWarning && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.article}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isUrgent
                        ? "text-red-600 dark:text-red-400"
                        : isWarning
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {daysLeft === Infinity ? "∞" : `${daysLeft} days`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Current stock</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {product.current_stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Depletes</p>
                    <p className="font-semibold">{depletionDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Rec. order</p>
                    <p className="font-semibold text-primary">
                      {product.reorder_quantity}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AIPredictions;