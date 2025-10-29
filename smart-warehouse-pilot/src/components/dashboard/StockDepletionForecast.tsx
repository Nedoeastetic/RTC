import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  article: string;
  name: string;
  current_stock: number;
  daily_consumption: number;
  min_stock_level: number;
}

const StockDepletionForecast = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("current_stock", { ascending: true });

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const calculateDaysUntilDepletion = (product: Product) => {
    if (product.daily_consumption === 0) return Infinity;
    return Math.floor(product.current_stock / product.daily_consumption);
  };

  const getDepletionDate = (product: Product) => {
    const days = calculateDaysUntilDepletion(product);
    if (days === Infinity) return "Не определено";
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("ru-RU");
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return "text-destructive";
    if (days <= 7) return "text-yellow-500";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Прогноз истощения запасов
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
                  <p className="text-muted-foreground">Осталось</p>
                  <p className="font-semibold">{product.current_stock} шт</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Через</p>
                  <p className={`font-semibold ${getUrgencyColor(daysLeft)}`}>
                    {daysLeft === Infinity ? "∞" : `${daysLeft} дн`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Дата</p>
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