import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, Package } from "lucide-react";

interface StockDepletionForecastProps {
  warehouseCode: string;
}

interface Product {
  id: string;
  article: string;
  name: string;
  current_stock: number;
  daily_consumption: number;
  min_stock_level: number;
}

const StockDepletionForecast = ({ warehouseCode }: StockDepletionForecastProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Loading stock depletion forecast for:', warehouseCode);
    fetchProducts();
  }, [warehouseCode]);

  const fetchProducts = async () => {
    setLoading(true);
    
    // TODO: Replace with real API call
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: "1",
          article: "TEL-4567",
          name: "Router RT-AC68U",
          current_stock: 45,
          daily_consumption: 5,
          min_stock_level: 20
        },
        {
          id: "2", 
          article: "TEL-8901",
          name: "Modem DSL-2640U",
          current_stock: 12,
          daily_consumption: 3,
          min_stock_level: 15
        },
        {
          id: "3",
          article: "CAB-2345",
          name: "Cable UTP Cat.5e", 
          current_stock: 3,
          daily_consumption: 2,
          min_stock_level: 10
        }
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
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

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return "text-red-500";
    if (days <= 7) return "text-yellow-500";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Stock Depletion Forecast - {warehouseCode}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.slice(0, 5).map((product) => {
          const daysLeft = calculateDaysUntilDepletion(product);
          const depletionDate = getDepletionDate(product);

          return (
            <div key={product.id} className="p-3 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.article}</p>
                </div>
                {daysLeft <= 7 && daysLeft !== Infinity && (
                  <AlertCircle className={`h-4 w-4 ${getUrgencyColor(daysLeft)}`} />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold">{product.current_stock} pcs</p>
                </div>
                <div>
                  <p className="text-muted-foreground">In</p>
                  <p className={`font-semibold ${getUrgencyColor(daysLeft)}`}>
                    {daysLeft === Infinity ? "∞" : `${daysLeft} days`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold text-xs">{depletionDate}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default StockDepletionForecast;