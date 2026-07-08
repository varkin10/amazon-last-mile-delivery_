import Link from "next/link";

export const metadata = {
  title: "Case Study — Last-Mile Delivery Analytics",
};

function Section({
  num,
  eyebrow,
  title,
  children,
}: {
  num: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-mono text-xs text-[var(--text-faint)]">{num}</span>
        <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent)] uppercase">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-2xl font-bold mb-5">{title}</h2>
      <div className="text-[var(--text-muted)] leading-relaxed space-y-4 text-[15px]">
        {children}
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block font-mono text-xs px-3 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card)] text-[var(--text)] mr-2 mb-2">
      {children}
    </span>
  );
}

export default function CaseStudy() {
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-16 md:py-20">
      <div className="font-mono text-[11px] tracking-[0.25em] text-[var(--accent)] mb-4 uppercase">
        Case Study
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold leading-[1.1] mb-6">
        Last-Mile Delivery Performance Optimization
      </h1>
      <p className="text-[var(--text-muted)] text-base leading-relaxed mb-16 max-w-xl">
        How a route-level breakdown of 43,443 real deliveries surfaced the
        bottom-performing dispatch zones and what a rebalancing fix would be
        worth.
      </p>

      <Section num="01" eyebrow="The Problem" title="What was going wrong">
        <p>
          Delivery performance looked fine in aggregate — a 66% on-time rate
          across the network — but aggregate numbers hide where the actual
          damage is happening. Some zones and shifts were badly underwater
          while others were near-perfect, and nobody was looking at the
          split.
        </p>
        <p>
          Without a route-level view, ops teams can&rsquo;t tell whether a
          missed SLA is a one-off or a structural problem with how volume,
          vehicles, and shifts are being matched to a zone.
        </p>
      </Section>

      <Section num="02" eyebrow="Why This Analysis" title="Why it was worth doing">
        <p>
          A 34-point swing in on-time rate between the best zone
          (Metropolitan mornings, 97.4%) and the worst (Urban evenings,
          49.1%) is not noise — it&rsquo;s a signal that dispatch and load-out
          decisions, not just traffic or weather, are driving a large share
          of the delay.
        </p>
        <p>
          If that gap can be narrowed even partially through rebalancing
          instead of adding fleet capacity, it&rsquo;s a lower-cost lever than
          hiring more drivers or vehicles — worth quantifying before
          recommending either path.
        </p>
      </Section>

      <Section num="03" eyebrow="Method" title="Factors included in the analysis">
        <p>
          Each of the 43,443 cleaned orders was enriched and evaluated
          across these factors:
        </p>
        <div className="pt-2">
          <Pill>Area (Urban / Metro / Semi-Urban / Other)</Pill>
          <Pill>Delivery window (Morning / Midday / Evening / Night)</Pill>
          <Pill>Vehicle type (motorcycle / scooter / van)</Pill>
          <Pill>Traffic level</Pill>
          <Pill>Weather condition</Pill>
          <Pill>Distance (Haversine, from GPS)</Pill>
          <Pill>Agent rating</Pill>
          <Pill>Product category</Pill>
        </div>
        <p className="pt-2">
          Route = Area × Delivery Window, used as a proxy for a dispatch
          zone-shift since the raw dataset carries no native route ID.
          On-time was benchmarked against 1.15× the median delivery time for
          each Category + Area combination, so slower categories (e.g.
          furniture) weren&rsquo;t unfairly penalized against faster ones
          (e.g. accessories).
        </p>
      </Section>

      <Section num="04" eyebrow="Metrics" title="KPIs considered">
        <ul className="list-disc list-inside space-y-2">
          <li><span className="text-[var(--text)]">On-time delivery rate</span> — the primary SLA metric, by route, vehicle, area, and window</li>
          <li><span className="text-[var(--text)]">Average delivery time</span> — minutes from order to drop-off</li>
          <li><span className="text-[var(--text)]">Average speed</span> — distance/time, a proxy for route efficiency and congestion drag</li>
          <li><span className="text-[var(--text)]">Delivery volume per route</span> — to avoid over-indexing on statistically small zones</li>
          <li><span className="text-[var(--text)]">Projected on-time lift and delay reduction</span> — the output of the rebalancing simulation, expressed in percentage points and minutes rather than a flat &ldquo;days saved&rdquo; number, since this dataset is same-day/same-shift delivery</li>
        </ul>
      </Section>

      <Section num="05" eyebrow="Findings" title="Results">
        <p>
          The bottom-decile routes were <span className="text-[var(--text)]">Urban | Evening</span> (49.1%
          on-time, 3,650 orders) and <span className="text-[var(--text)]">Metropolitan | Evening</span>
          {" "}(55.0%, 14,277 orders — the single largest zone by volume). Evening
          as a window underperformed every other window by 12&ndash;40 points.
        </p>
        <p>
          Motorcycles carried the most volume (25,394 orders) but had the
          lowest on-time rate of the three vehicle types (62.0%, vs. 71.5%
          for scooters and 72.0% for vans) — a fleet-mix signal, not just a
          traffic one.
        </p>
        <p>
          Modeling a 40% shift of Evening volume in the two worst zones into
          higher-performing Night/Morning windows projected a multi-point
          lift in overall on-time rate and a measurable cut in average
          delivery time — reproducible live in the dashboard slider or the
          Excel model.
        </p>
      </Section>

      <Section num="06" eyebrow="Next Steps" title="Recommendations to stakeholders">
        <ol className="list-decimal list-inside space-y-3">
          <li>
            <span className="text-[var(--text)]">Rebalance Evening load-out sequencing first</span> —
            it&rsquo;s the highest-volume, lowest-cost lever (no new
            headcount or fleet) and the largest single opportunity
            identified.
          </li>
          <li>
            <span className="text-[var(--text)]">Re-examine motorcycle allocation in Evening/Urban zones</span> —
            either add scooters/vans to those slots or investigate whether
            motorcycle routing needs shorter, denser stop clusters.
          </li>
          <li>
            <span className="text-[var(--text)]">Treat Morning as the benchmark, not the exception</span> —
            97%+ on-time in Metro mornings shows the network&rsquo;s ceiling;
            use it to set realistic SLA targets for other windows instead of
            a flat network-wide target.
          </li>
          <li>
            <span className="text-[var(--text)]">Pilot before scaling</span> —
            run the rebalancing shift on one zone for 2&ndash;4 weeks, measure
            actual vs. projected lift, then decide whether to extend it
            network-wide.
          </li>
        </ol>
      </Section>

      <div className="border-t border-[var(--card-border)] pt-8">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}
