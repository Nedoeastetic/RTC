import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  article: string;
  name: string;
  current_stock: number;
  daily_consumption: number;
  min_stock_level: number;
  reorder_quantity: number;
}

const ReplenishmentNeeds = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalNeeded, setTotalNeeded] = useState(0);

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
      const productsData = data as Product[];
      setProducts(productsData);
      
      const total = productsData.reduce((sum, product) => {
        if (product.current_stock < product.min_stock_level) {
          return sum + 1;
        }
        return sum;
      }, 0);
      setTotalNeeded(total);
    }
    setLoading(false);
  };

  const needsReplenishment = (product: Product) => {
    return product.current_stock < product.min_stock_level;
  };

  const getReplenishmentAmount = (product: Product) => {
    if (!needsReplenishment(product)) return 0;
    return product.reorder_quantity;
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

  const productsNeedingReplenishment = products.filter(needsReplenishment);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Потребности в пополнении
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Товаров требует пополнения</p>
              <p className="text-3xl font-bold text-primary">{totalNeeded}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          {productsNeedingReplenishment.slice(0, 4).map((product) => (
            <div key={product.id} className="p-3 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.article}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Текущий</p>
                  <p className="font-semibold text-destructive">{product.current_stock}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Мин. уровень</p>
                  <p className="font-semibold">{product.min_stock_level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Пополнить</p>
                  <p className="font-semibold text-primary">{getReplenishmentAmount(product)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReplenishmentNeeds;