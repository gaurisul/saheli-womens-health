import React from 'react';
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
import { Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Custom chart tooltip declared outside render
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.painScore === null) {
      return (
        <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.8rem', boxShadow: 'var(--shadow-card)' }}>
          <strong>{data.day}</strong>
          <div style={{ color: 'var(--text-muted)' }}>No symptoms logged for this day</div>
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
          <div style={{ color: '#9C4532', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>
            ⚠️ Functional disability reported
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
  const { logs, currentProfile } = useApp();

  // Prepare data sorted by cycle day
  const cycleDaysData = [];
  const totalDays = Math.max(currentProfile.typicalCycleLength || 28, 28);

  // Group logs into cycle days or prepare entries array
  const entries = Object.values(logs);
  
  // Create an array for days 1 to totalDays
  for (let day = 1; day <= totalDays; day++) {
    const matchingLog = entries.find((e) => e.cycleDay === day);
    cycleDaysData.push({
      day: `Day ${day}`,
      cycleDay: day,
      painScore: matchingLog ? matchingLog.painScore : null,
      bleeding: matchingLog ? matchingLog.bleeding : 'None',
      symptoms: matchingLog ? matchingLog.symptoms : [],
      functionalImpact: matchingLog ? matchingLog.functionalImpact : false,
      notes: matchingLog ? matchingLog.notes : '',
      date: matchingLog ? matchingLog.date : null
    });
  }

  return (
    <div className="saheli-card">
      <div className="card-header-row">
        <div>
          <div className="card-title">
            <Activity size={18} color="var(--color-berry)" />
            <span>Pain Severity Profile Across Cycle</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Visualizing cyclic pain peaks (0 = None, 10 = Debilitating). High severity threshold marked at 7/10.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-terracotta" style={{ fontSize: '0.68rem' }}>
            Severe Peak ≥ 7
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: 260, marginTop: '0.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cycleDaysData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B1D3A" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#E4B5C6" stopOpacity={0.05} />
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
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#painGradient)"
              connectNulls={false}
              dot={{ r: 3, fill: 'var(--color-berry)', strokeWidth: 1.5, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: 'var(--color-berry)', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-card)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Days 1–5: Menstrual Phase</span>
        <span>Days 6–13: Follicular</span>
        <span>Days 14–16: Ovulation Window</span>
        <span>Days 17–29: Luteal Phase</span>
      </div>
    </div>
  );
}
