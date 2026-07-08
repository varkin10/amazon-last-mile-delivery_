"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import data from "@/data/data.json";

type Route = {
  Route_ID: string;
  deliveries: number;
  avg_delivery_min: number;
  avg_distance_km: number;
  avg_speed_kmh: number;
  on_time_pct: number;
};

const routes = data.routes as Route[];
const vehicles = data.vehicles as {
  Vehicle: string;
  deliveries: number;
  avg_delivery_min: number;
  on_time_pct: number;
}[];
const areas = data.areas as {
  Area: string;
  deliveries: number;
  avg_delivery_min: number;
  on_time_pct: number;
}[];
const windows = data.windows as {
  Delivery_Window: string;
  deliveries: number;
  avg_delivery_min: number;
  on_time_pct: number;
}[];
const overall = data.overall as {
  on_time_pct: number;
  avg_delivery_min: number;
  total: number;
};

const worst = [...routes].sort((a, b) => a.on_time_pct - b.on_time_pct)[0];
const best = [...routes].sort((a, b) => b.on_time_pct - a.on_time_pct)[0];
const sortedManifest = [...routes].sort((a, b) => a.on_time_pct - b.on_time_pct);

function colorFor(pct: number) {
  if (pct < 60) return "var(--bad)";
  if (pct < 80) return "var(--accent)";
  return "var(--good)";
}

function findRoute(area: string, window: string) {
  return routes.find((r) => r.Route_ID === area + " | " + window);
}

export default function Home() {
  const [shiftPct, setShiftPct] = useState(40);

  const sim = useMemo(() => {
    const urbanEve = findRoute("Urban", "Evening");
    const metroEve = findRoute("Metropolitian", "Evening");
    const urbanNight = findRoute("Urban", "Night");
    const metroNight = findRoute("Metropolitian", "Night");
    const urbanMorn = findRoute("Urban", "Morning");
    const metroMorn = findRoute("Metropolitian", "Morning");
    if (!urbanEve || !metroEve || !urbanNight || !metroNight || !urbanMorn || !metroMorn) {
      return null;
    }
    const totalVol = routes.reduce((s, r) => s + r.deliveries, 0);
    const baselineOnTimeWeighted =
      routes.reduce((s, r) => s + r.deliveries * r.on_time_pct, 0) / totalVol;
    const baselineAvgTime =
      routes.reduce((s, r) => s + r.deliveries * r.avg_delivery_min, 0) / totalVol;

    const shift = shiftPct / 100;
    const evVolU = urbanEve.deliveries;
    const evVolM = metroEve.deliveries;
    const shiftedVol = (evVolU + evVolM) * shift;
    const destRate =
      (urbanNight.on_time_pct + metroNight.on_time_pct + urbanMorn.on_time_pct + metroMorn.on_time_pct) / 4;
    const residualRate = (urbanEve.on_time_pct + metroEve.on_time_pct) / 2;

    const unaffectedOnTimeSum =
      routes.reduce((s, r) => s + r.deliveries * r.on_time_pct, 0) -
      evVolU * urbanEve.on_time_pct -
      evVolM * metroEve.on_time_pct;
    const residualOnTimeSum = (evVolU + evVolM) * (1 - shift) * residualRate;
    const shiftedOnTimeSum = shiftedVol * destRate;

    const projectedOnTime = (unaffectedOnTimeSum + residualOnTimeSum + shiftedOnTimeSum) / totalVol;
    const improvementPp = projectedOnTime - baselineOnTimeWeighted;
    const projectedAvgTime = baselineAvgTime * (1 - (improvementPp / 100) * 0.35);
    const timeReduction = baselineAvgTime - projectedAvgTime;

    return {
      baselineOnTimeWeighted,
      baselineAvgTime,
      projectedOnTime,
      improvementPp,
      projectedAvgTime,
      timeReduction,
    };
  }, [shiftPct]);

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-16 md:py-20">
      <header className="mb-16">
        <div className="font-mono text-[11px] tracking-[0.25em] text-[var(--accent)] mb-4 uppercase">
          Last-Mile Delivery Analytics · Route Manifest No. 001
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.05] mb-4">
          Last-Mile Delivery
          <br />
          Performance Optimization
        </h1>
        <p className="text-[var(--text-muted)] text-base md:text-lg max-w-xl leading-relaxed">
          {overall.total.toLocaleString()} deliveries analyzed across routes, weather,
          traffic, and vehicle type to isolate the bottom-performing zones and
          model a rebalancing fix.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--card-border)] rounded-lg overflow-hidden mb-6">
        <Kpi label="Deliveries analyzed" value={overall.total.toLocaleString()} />
        <Kpi label="Overall on-time" value={overall.on_time_pct + "%"} accent="good" />
        <Kpi label="Worst zone on-time" value={worst.on_time_pct + "%"} sub={worst.Route_ID} accent="bad" />
        <Kpi label="Best zone on-time" value={best.on_time_pct + "%"} sub={best.Route_ID} accent="good" />
      </section>

      <section className="mb-20">
        <SectionHeading eyebrow="Manifest — sorted worst to best" title="Route on-time performance" />
        <div className="border border-[var(--card-border)] rounded-lg overflow-hidden bg-[var(--card)]">
          {sortedManifest.map((r, i) => (
            <div
              key={r.Route_ID}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-[var(--card-border)] last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-mono text-xs text-[var(--text-faint)] w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-sm w-52 shrink-0 truncate">{r.Route_ID}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-alt)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: r.on_time_pct + "%", background: colorFor(r.on_time_pct) }}
                />
              </div>
              <span className="font-mono text-sm w-14 text-right shrink-0" style={{ color: colorFor(r.on_time_pct) }}>
                {r.on_time_pct}%
              </span>
              <span className="font-mono text-xs text-[var(--text-faint)] w-20 text-right shrink-0 hidden md:block">
                {r.deliveries.toLocaleString()} ord.
              </span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[11px] text-[var(--text-faint)] mt-3 leading-relaxed">
          Route = Area × Delivery Window (proxy for a dispatch zone-shift; the source dataset has no native route ID).
        </p>
      </section>

      <section className="mb-20">
        <SectionHeading eyebrow="What-if model" title="Route rebalancing & load-out sequencing" />
        <div className="border border-[var(--card-border)] rounded-lg bg-[var(--card)] p-6 md:p-8">
          <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed max-w-2xl">
            Shift a share of Evening-window volume in the two worst zones (Urban, Metropolitan) into
            higher-performing Night / Morning windows via revised load-out sequencing. Drag to see the
            projected impact.
          </p>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Evening volume shifted
              </label>
              <span className="font-mono text-lg text-[var(--accent)] font-medium">{shiftPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={shiftPct}
              onChange={(e) => setShiftPct(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
          {sim && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <SimStat label="On-time before" value={sim.baselineOnTimeWeighted.toFixed(1) + "%"} />
              <SimStat label="On-time after" value={sim.projectedOnTime.toFixed(1) + "%"} accent="good" />
              <SimStat label="On-time lift" value={"+" + sim.improvementPp.toFixed(1) + "pp"} accent="good" />
              <SimStat label="Avg delay cut" value={sim.timeReduction.toFixed(1) + " min"} accent="good" />
            </div>
          )}
        </div>
      </section>

      <section className="mb-20 grid md:grid-cols-3 gap-8">
        <ChartCard title="By vehicle type" data={vehicles} nameKey="Vehicle" />
        <ChartCard title="By area" data={areas} nameKey="Area" />
        <ChartCard title="By delivery window" data={windows} nameKey="Delivery_Window" />
      </section>

      <footer className="border-t border-[var(--card-border)] pt-8 pb-4">
        <h3 className="font-display text-sm font-bold mb-3 text-[var(--text-muted)] uppercase tracking-wide">
          Methodology
        </h3>
        <p className="text-sm text-[var(--text-faint)] leading-relaxed max-w-2xl">
          Source: Amazon Delivery Dataset (Kaggle), 43,739 orders, cleaned to 43,443. Distance computed via
          Haversine from GPS coordinates. On-time benchmark = 1.15× the median delivery time for each
          Category + Area combination. Route rebalancing simulation is a volume-weighted blend of
          destination-window on-time rates, reproduced in the companion SQL and Excel workbook.
        </p>
      </footer>
    </main>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "good" | "bad";
}) {
  const color = accent === "good" ? "var(--good)" : accent === "bad" ? "var(--bad)" : "var(--text)";
  return (
    <div className="bg-[var(--card)] px-5 py-5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-2">{label}</div>
      <div className="font-display text-2xl md:text-3xl font-bold" style={{ color }}>
        {value}
      </div>
      {sub && <div className="font-mono text-[10px] text-[var(--text-faint)] mt-1 truncate">{sub}</div>}
    </div>
  );
}

function SimStat({ label, value, accent }: { label: string; value: string; accent?: "good" }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] mb-1">{label}</div>
      <div
        className="font-display text-xl md:text-2xl font-bold"
        style={{ color: accent === "good" ? "var(--good)" : "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent)] uppercase mb-2">{eyebrow}</div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
    </div>
  );
}

function ChartCard({
  title,
  data,
  nameKey,
}: {
  title: string;
  data: { on_time_pct: number; [key: string]: string | number }[];
  nameKey: string;
}) {
  return (
    <div className="border border-[var(--card-border)] rounded-lg bg-[var(--card)] p-5">
      <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-4">{title}</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2F38" vertical={false} />
          <XAxis dataKey={nameKey} tick={{ fill: "#8B93A1", fontSize: 10 }} axisLine={{ stroke: "#2A2F38" }} tickLine={false} />
          <YAxis tick={{ fill: "#8B93A1", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ background: "#1B2027", border: "1px solid #2A2F38", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#ECEEF1" }}
          />
          <Bar dataKey="on_time_pct" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={colorFor(entry.on_time_pct)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
