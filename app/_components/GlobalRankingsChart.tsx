"use client";

import { useEffect, useState } from "react";
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
import {
  GLOBAL_RANKING_SOURCES,
  GLOBAL_RANKING_YEARS,
} from "../../constants/globalRankingsData";
const CHART_DATA = GLOBAL_RANKING_YEARS.map((year) => ({
  year: `${year}年`,
  yearNum: year,
  ft: GLOBAL_RANKING_SOURCES.ft.data[year] ?? null,
  qs: GLOBAL_RANKING_SOURCES.qs.data[year] ?? null,
  bloomberg: GLOBAL_RANKING_SOURCES.bloomberg.data[year] ?? null,
  forbes: GLOBAL_RANKING_SOURCES.forbes.data[year] ?? null,
}));

const COLORS = {
  ft: GLOBAL_RANKING_SOURCES.ft.color,
  qs: GLOBAL_RANKING_SOURCES.qs.color,
  bloomberg: GLOBAL_RANKING_SOURCES.bloomberg.color,
  forbes: GLOBAL_RANKING_SOURCES.forbes.color,
};

const LEGEND_LABELS: Record<string, string> = {
  ft: GLOBAL_RANKING_SOURCES.ft.label,
  qs: GLOBAL_RANKING_SOURCES.qs.label,
  bloomberg: GLOBAL_RANKING_SOURCES.bloomberg.label,
  forbes: GLOBAL_RANKING_SOURCES.forbes.label,
};

export function GlobalRankingsChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center">
        <span className="text-sm text-slate-500">チャートを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[320px] w-full overflow-x-auto">
      <div className="min-w-[380px] w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={380}>
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
            // 修正テスト
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
