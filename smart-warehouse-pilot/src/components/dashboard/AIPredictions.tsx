import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface Prediction {
  product: string;
  currentStock: number;
  depletionDate: string;
  recommendedOrder: number;
}

const mockPredictions: Prediction[] = [
  {
    product: "Роутер RT-AC68U",
    currentStock: 45,
    depletionDate: "2024-03-22",
    recommendedOrder: 150,
  },
  {
    product: "Модем DSL-2640U",
    currentStock: 12,
    depletionDate: "2024-03-18",
    recommendedOrder: 200,
  },
  {
    product: "Кабель UTP Cat.5e",
    currentStock: 3,
    depletionDate: "2024-03-16",
    recommendedOrder: 500,
  },
  {
    product: "Коммутатор GS108E",
    currentStock: 8,
    depletionDate: "2024-03-19",
    recommendedOrder: 100,
  },
  {
    product: "Точка доступа UAP-AC-LR",
    currentStock: 18,
    depletionDate: "2024-03-21",
    recommendedOrder: 80,
  },
];

const AIPredictions = () => {
  const [predictions] = useState(mockPredictions);
  const [loading, setLoading] = useState(false);
  const [confidence] = useState(87);

  const handleRefresh = () => {
    setLoading(true);
    toast.info("Обновление прогноза...");
    setTimeout(() => {
      setLoading(false);
      toast.success("Прогноз обновлен");
    }, 1500);
  };

  const getDaysUntilDepletion = (date: string) => {
    const today = new Date();
    const depletionDate = new Date(date);
    const diffTime = depletionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingDown className="mr-2 h-4 w-4 text-secondary" />
            Прогноз ИИ на следующие 7 дней
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Достоверность прогноза: <span className="font-semibold text-secondary">{confidence}%</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-3 pr-2">
          {predictions.map((prediction, index) => {
            const daysLeft = getDaysUntilDepletion(prediction.depletionDate);
            return (
              <div
                key={index}
                className="border border-border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">{prediction.product}</h4>
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      daysLeft <= 2
                        ? "bg-destructive/10 text-destructive"
                        : daysLeft <= 5
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {daysLeft} дней
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Текущий остаток:</span>
                    <span className="font-medium text-foreground">{prediction.currentStock} шт.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Дата исчерпания:</span>
                    <span className="font-medium text-foreground">
                      {new Date(prediction.depletionDate).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border">
                    <span className="text-muted-foreground">Рекомендуется заказать:</span>
                    <span className="font-semibold text-primary">{prediction.recommendedOrder} шт.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPredictions;
