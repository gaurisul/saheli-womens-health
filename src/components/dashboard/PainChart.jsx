import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Activity, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { findPeriodStarts, getDaysDiff, parseDate } from '../../utils/cycleCalculations';
import { formatDate } from '../../data/sampleProfiles';

// Custom tooltip declared outside render
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.painScore === null) {
      return (
        <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.8rem', boxShadow: 'var(--shadow-card)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{data.day}</strong>
          {data.date && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{data.date}</div>}
          <div style={{ color: 'var(--text-muted)' }}>No symptoms logged for this cycle day</div>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '0.85rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border-card)',
        fontSize: '0.82rem',
        boxShadow: 'var(--shadow-elevated)',
        maxWidth: '260px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.35rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-berry)' }}>{data.day}</span>
          {data.date && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{data.date}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Pain Severity:</span>
          <strong style={{ color: data.painScore >= 7 ? 'var(--color-terracotta)' : 'var(--color-berry)' }}>
            {data.painScore} / 10
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Flow:</span>
          <span className="badge badge-berry" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
            {data.bleeding}
          </span>
        </div>

        {data.functionalImpact && (
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.74rem', fontWeight: 600, marginTop: '0.2rem' }}>
            ⚠️ Functional disruption reported
          </div>
        )}

        {data.symptoms && data.symptoms.length > 0 && (
          <div style={{ marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-card)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <strong>Symptoms:</strong> {data.symptoms.slice(0, 3).join(', ')}
            {data.symptoms.length > 3 && ` +${data.symptoms.length - 3} more`}
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function PainChart() {
  const { logs, currentProfile, summaryMetrics } = useApp();

  const sortedDates = useMemo(() => Object.keys(logs).sort(), [logs]);
  const periodStarts = useMemo(() => findPeriodStarts(logs), [logs]);
  const hasLogs = summaryMetrics.totalLoggedDays > 0;

  // Task 6: Derive cycle groupings without collapsing different cycles
  const cycles = useMemo(() => {
    if (sortedDates.length === 0) return [];

    const list = [];

    if (periodStarts.length === 0) {
      // Single continuous diary timeline
      const startDate = sortedDates[0];
      const cycleEntries = Object.entries(logs).map(([d, val]) => ({ date: d, ...val }));
      list.push({
        id: 'current',
        label: 'Active Diary Cycle',
        startDate,
        endDate: null,
        entries: cycleEntries,
        isCurrent: true
      });
      return list;
    }

    // Latest period start is Current Cycle (Active)
    const latestStart = periodStarts[periodStarts.length - 1];
    const currentEntries = Object.entries(logs)
      .filter(([d]) => d >= latestStart)
      .map(([d, val]) => ({ date: d, ...val }));

    list.push({
      id: 'current',
      label: 'Current Cycle (Active)',
      startDate: latestStart,
      endDate: null,
      entries: currentEntries,
      isCurrent: true
    });

    // Preceding completed cycles
    for (let i = periodStarts.length - 2; i >= 0; i--) {
      const start = periodStarts[i];
      const nextStart = periodStarts[i + 1];
      const cycleEntries = Object.entries(logs)
        .filter(([d]) => d >= start && d < nextStart)
        .map(([d, val]) => ({ date: d, ...val }));
      const cycleIdx = periodStarts.length - 1 - i;
      list.push({
        id: `cycle-${i}`,
        label: `Preceding Cycle (-${cycleIdx})`,
        startDate: start,
        endDate: nextStart,
        entries: cycleEntries,
        isCurrent: false
      });
    }

    return list;
  }, [logs, periodStarts, sortedDates]);

  const [selectedCycleId, setSelectedCycleId] = useState('current');

  // Match selected cycle or default to current
  const activeCycle = useMemo(() => {
    return cycles.find((c) => c.id === selectedCycleId) || cycles[0] || null;
  }, [cycles, selectedCycleId]);

  const typicalPeriod = Number(currentProfile.typicalPeriodLength) || 5;
  const typicalCycle = Number(currentProfile.typicalCycleLength) || 28;

  // Prepare chart dataset for activeCycle without fabricating unlogged values
  const { cycleDaysData, totalDays, fertileStart, fertileEnd } = useMemo(() => {
    if (!activeCycle) {
      return { cycleDaysData: [], totalDays: typicalCycle, fertileStart: 13, fertileEnd: 16 };
    }

    // Map entries by their calculated cycleDay relative to this cycle's start date
    const entryByDay = new Map();
    let maxCycleDay = typicalCycle;

    activeCycle.entries.forEach((e) => {
      let cDay = 1;
      if (activeCycle.startDate) {
        const diff = getDaysDiff(activeCycle.startDate, e.date);
        cDay = diff >= 0 ? diff + 1 : (Number(e.cycleDay) || 1);
      } else {
        cDay = Number(e.cycleDay) || 1;
      }
      if (cDay > maxCycleDay) maxCycleDay = cDay;
      entryByDay.set(cDay, { ...e, calculatedCycleDay: cDay });
    });

    const displayDays = Math.max(maxCycleDay, typicalCycle, 28);
    const data = [];

    for (let day = 1; day <= displayDays; day++) {
      const log = entryByDay.get(day);
      let dayDateStr = null;
      if (log?.date) {
        dayDateStr = log.date;
      } else if (activeCycle.startDate) {
        const d = parseDate(activeCycle.startDate);
        d.setDate(d.getDate() + (day - 1));
        dayDateStr = formatDate(d);
      }

      data.push({
        day: `Day ${day}`,
        cycleDay: day,
        // Preserve actual zero ratings (0), but distinguish unrecorded days as null
        painScore: (log && log.painScore !== undefined && log.painScore !== null && log.painScore !== '')
          ? Number(log.painScore)
          : null,
        bleeding: log ? (log.bleeding || 'None') : 'None',
        symptoms: log ? (log.symptoms || []) : [],
        functionalImpact: Boolean(log?.functionalImpact),
        notes: log ? (log.notes || '') : '',
        date: dayDateStr,
        isLogged: Boolean(log)
      });
    }

    const ovulationDay = Math.max(typicalPeriod + 2, displayDays - 14);
    const fStart = Math.max(typicalPeriod + 1, ovulationDay - 3);
    const fEnd = Math.min(displayDays - 1, ovulationDay + 1);

    return {
      cycleDaysData: data,
      totalDays: displayDays,
      fertileStart: fStart,
      fertileEnd: fEnd
    };
  }, [activeCycle, typicalCycle, typicalPeriod]);

  return (
    <div className="saheli-card">
      <div className="card-header-row">
        <div>
          <div className="card-title">
            <Activity size={18} color="var(--color-berry)" />
            <span>Pain Severity Profile Across Cycle</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {activeCycle?.isCurrent
              ? `Current Cycle: Started ${activeCycle.startDate} (${activeCycle.entries.length} days logged)`
              : activeCycle
                ? `Historical Cycle: ${activeCycle.startDate} to ${activeCycle.endDate} (${activeCycle.entries.length} days logged)`
                : 'Visualizes cyclic pain peaks (0 = Comfortable, 10 = Incapacitating). High severity threshold marked at 7/10.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {cycles.length > 1 && (
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              {cycles.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCycleId(c.id)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: activeCycle?.id === c.id ? 'var(--color-berry)' : 'transparent',
                    color: activeCycle?.id === c.id ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <span className="badge badge-terracotta" style={{ fontSize: '0.68rem' }}>
            Severe Threshold (≥ 7)
          </span>
        </div>
      </div>

      {!hasLogs ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <Info size={24} color="var(--color-berry)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No Pain Entries Recorded Yet
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            As you complete daily check-ins, your pain trajectory will plot across your cycle to help detect dysmenorrhea or ovulatory spikes.
          </p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 260, marginTop: '0.5rem', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cycleDaysData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B1D3A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F5E6EB" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card)" />
              <XAxis
                dataKey="cycleDay"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-card)' }}
                tickFormatter={(v) => `D${v}`}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-card)' }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference Line for Severe threshold (7) */}
              <ReferenceLine
                y={7}
                stroke="#C25E48"
                strokeDasharray="4 4"
                label={{
                  value: 'Severe (7+)',
                  position: 'right',
                  fill: '#C25E48',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />

              <Area
                type="monotone"
                dataKey="painScore"
                stroke="var(--color-berry)"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#painGradient)"
                connectNulls={false}
                dot={{ r: 3, fill: 'var(--color-berry)', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: 'var(--color-berry)', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-card)', fontSize: '0.74rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>Days 1–{typicalPeriod}: Menstrual Phase</span>
        <span>Days {typicalPeriod + 1}–{fertileStart - 1}: Follicular</span>
        <span>Days {fertileStart}–{fertileEnd}: Ovulatory Window</span>
        <span>Days {fertileEnd + 1}–{totalDays}: Luteal Phase</span>
      </div>
    </div>
  );
}
