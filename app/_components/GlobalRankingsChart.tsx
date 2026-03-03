"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// Financial Times (Global MBA)
const FT: Record<number, number> = {
  2016: 1,
  2017: 1,
  2018: 2,
  2019: 3,
  2020: 4,
  2021: 1,
  2022: 3,
  2023: 2,
  2024: 2,
  2025: 2,
  2026: 2,
};

// QS (Global MBA)
const QS: Record<number, number> = {
  2018: 2,
  2019: 6,
  2020: 3,
  2021: 6,
  2022: 7,
  2023: 9,
  2024: 9,
  2025: 11,
  2026: 8,
};

// Bloomberg (International/European)
const BLOOMBERG: Record<number, number> = {
  2016: 1,
  2017: 1,
  2018: 1,
  2019: 2,
  2021: 2,
  2022: 3,
  2023: 5,
  2024: 5,
  2025: 5,
};

// Forbes (Best International 1-Year MBA) — 隔年
const FORBES: Record<number, number> = {
  2017: 2,
  2019: 2,
  2021: 1,
  2023: 2,
};

const CHART_DATA = YEARS.map((year) => ({
  year: `${year}年`,
  yearNum: year,
  ft: FT[year] ?? null,
  qs: QS[year] ?? null,
  bloomberg: BLOOMBERG[year] ?? null,
  forbes: FORBES[year] ?? null,
}));

const COLORS = {
  ft: "#005543",
  qs: "#0ea5e9",
  bloomberg: "#f59e0b",
  forbes: "#8b5cf6",
};

const LEGEND_LABELS: Record<string, string> = {
  ft: "Financial Times",
  qs: "QS",
  bloomberg: "Bloomberg",
  forbes: "Forbes",
};

export function GlobalRankingsChart() {
  return (
    <div className="min-h-[320px] w-full overflow-x-auto">
      <div className="min-w-[380px] w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={CHART_DATA}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            domain={[15, 1]}
            reversed
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
            label={{
              value: "順位",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#64748b" },
            }}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value, name) =>
              value != null && typeof value === "number"
                ? `${LEGEND_LABELS[String(name)] ?? name}: ${value}位`
                : null
            }
            labelFormatter={(label) => label}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => LEGEND_LABELS[value] ?? value}
          />
          <Line
            type="linear"
            dataKey="ft"
            name="ft"
            stroke={COLORS.ft}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.ft }}
            connectNulls
          />
          <Line
            type="linear"
            dataKey="qs"
            name="qs"
            stroke={COLORS.qs}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.qs }}
            connectNulls
          />
          <Line
            type="linear"
            dataKey="bloomberg"
            name="bloomberg"
            stroke={COLORS.bloomberg}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.bloomberg }}
            connectNulls
          />
          <Line
            type="linear"
            dataKey="forbes"
            name="forbes"
            stroke={COLORS.forbes}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.forbes }}
            connectNulls
          />
        </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
