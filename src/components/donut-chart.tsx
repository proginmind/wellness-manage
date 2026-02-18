"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DonutChartProps {
  data: Array<{ name: string; value: number; fill: string }>;
  title: string;
  description: string;
  valueFormat?: "number" | "currency";
}

export function DonutChart({ data, title, description, valueFormat = "number" }: DonutChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const formatValue = (value: number): string => {
    if (valueFormat === "currency") {
      return `$${value.toFixed(2)}`;
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatValue(value)}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatValue(totalValue)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
