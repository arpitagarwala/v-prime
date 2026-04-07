'use client';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './AssetAllocationRing.module.css';

const COLORS = ['#2962FF', '#00E676', '#FFAB00', '#FF3D00', '#7C4DFF'];

export default function AssetAllocationRing() {
  const { holdings, isLoading } = usePortfolio();

  // Calculate allocation based on Market Value
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  
  // Sort and take top 4, group others
  const sorted = [...holdings].sort((a, b) => b.currentValue - a.currentValue);
  const top4 = sorted.slice(0, 4);
  const othersValue = sorted.slice(4).reduce((sum, h) => sum + h.currentValue, 0);

  const data = top4.map(h => ({
    name: h.symbol,
    value: h.currentValue,
    pct: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0
  }));

  if (othersValue > 0) {
    data.push({
      name: 'Others',
      value: othersValue,
      pct: (othersValue / totalValue) * 100
    });
  }

  if (isLoading && holdings.length === 0) {
    return <div className={styles.loading}>Calculating allocation...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.chartContainer}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0B1221', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Value']}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>No assets found</div>
        )}
      </div>

      <div className={styles.legend}>
        {data.map((entry, index) => (
          <div key={entry.name} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: COLORS[index % COLORS.length] }}></div>
            <div className={styles.legendInfo}>
              <span className={styles.legendName}>{entry.name}</span>
              <span className={styles.legendPct}>{entry.pct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
