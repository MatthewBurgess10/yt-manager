import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface SentimentData {
  score: number;
  sentiment: "Positive" | "Negative";
}

interface SentimentGaugeProps {
  data: SentimentData;
  size?: number;
}

const SentimentGauge = ({ data, size = 300 }: SentimentGaugeProps) => {
  const { score, sentiment } = data;

  const clampedScore = Math.max(0, Math.min(100, score));

  // 🔒 Fallbacks GUARANTEE color
  const activeColor =
    sentiment === "Positive"
      ? "hsl(var(--gauge-positive, 142 71% 45%))"
      : "hsl(var(--gauge-negative, 0 84% 60%))";

  const inactiveColor =
    "hsl(var(--gauge-inactive, 220 14% 90%))";

  const gaugeData = [
    { name: "score", value: clampedScore },
    { name: "remaining", value: 100 - clampedScore },
  ];

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={gaugeData}
            dataKey="value"
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="100%"
            stroke="none"
          >
            {gaugeData.map((_, index) => (
              <Cell
                key={index}
                fill={index === 0 ? activeColor : inactiveColor}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-4xl font-bold" style={{ color: activeColor }}>
          {clampedScore}
        </p>
        <p className="text-sm font-semibold uppercase" style={{ color: activeColor }}>
          {sentiment}
        </p>
      </div>
    </div>
  );
};

export default SentimentGauge;
