"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { ar } from "@/content/ar";

const TEAL = "#0e5a52";
const LINE = "#e3e9e7";
const INK60 = "#5a6a68";

const axisTick = { fontSize: 12, fill: INK60, fontFamily: "var(--font-mono)" };

const tooltipStyle = {
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  fontSize: 12,
  fontFamily: "var(--font-sans)",
} as const;

export function AppointmentsPerDayChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="perDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity={0.25} />
            <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
        <XAxis
          dataKey="label"
          tick={axisTick}
          interval={4}
          tickLine={false}
          axisLine={{ stroke: LINE }}
        />
        <YAxis
          tick={axisTick}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(l) => l}
          formatter={(v) => [v, ar.admin.overview.chartAppointments]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={TEAL}
          strokeWidth={2}
          fill="url(#perDay)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AppointmentsPerDepartmentChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: INK60, fontFamily: "var(--font-sans)" }}
          tickLine={false}
          axisLine={{ stroke: LINE }}
        />
        <YAxis
          tick={axisTick}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "#dcede9", opacity: 0.4 }}
          formatter={(v) => [v, ar.admin.overview.chartAppointments]}
        />
        <Bar dataKey="count" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
