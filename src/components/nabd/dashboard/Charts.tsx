"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/**
 * Overview charts (Recharts). One teal series each, a muted grid, tabular
 * figures — the palette stays inside CLAUDE.md §4. Axes are reversed so the
 * time/category axis reads right-to-left.
 */

const TEAL = "#0E5A52";
const LINE = "#E3E9E7";
const MUTED = "#5b706d";

const axisStyle = { fontSize: 11, fontFamily: "var(--font-mono)", fill: MUTED };

const tooltipStyle = {
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
} as const;

export function AppointmentsPerDayChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={LINE} vertical={false} />
        <XAxis
          dataKey="date"
          reversed
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: LINE }}
          interval={4}
        />
        <YAxis
          orientation="right"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={TEAL}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AppointmentsPerDeptChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={LINE} vertical={false} />
        <XAxis
          dataKey="name"
          reversed
          tick={{ ...axisStyle, fontFamily: "var(--font-sans)" }}
          tickLine={false}
          axisLine={{ stroke: LINE }}
        />
        <YAxis
          orientation="right"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#DCEDE9" }} />
        <Bar dataKey="count" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
