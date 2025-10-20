import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 3600000).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }),
  router: Math.floor(Math.random() * 20) + 40,
  modem: Math.floor(Math.random() * 15) + 10,
  cable: Math.floor(Math.random() * 10) + 5,
}));

const TrendChart = () => {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">График остатков по выбранным товарам</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mockChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Количество (шт.)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="router"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            name="Роутер RT-AC68U"
            dot={{ fill: "hsl(var(--chart-1))" }}
          />
          <Line
            type="monotone"
            dataKey="modem"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name="Модем DSL-2640U"
            dot={{ fill: "hsl(var(--chart-2))" }}
          />
          <Line
            type="monotone"
            dataKey="cable"
            stroke="hsl(var(--chart-5))"
            strokeWidth={2}
            name="Кабель UTP Cat.5e"
            dot={{ fill: "hsl(var(--chart-5))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
