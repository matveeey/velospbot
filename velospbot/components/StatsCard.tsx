'use client'

import { Stats } from '@/hooks/useLocationTracking';

interface StatsCardProps {
  stats: Stats;
}

export default function StatsCard({ stats }: StatsCardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      backgroundColor: 'var(--tg-theme-secondary-bg-color)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        <div>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>Текущая скорость</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {stats.currentSpeed.toFixed(1)} км/ч
          </div>
        </div>
        
        <div>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>Средняя скорость</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {stats.medianSpeed.toFixed(1)} км/ч
          </div>
        </div>
        
        <div>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>Расстояние</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {stats.distance.toFixed(2)} км
          </div>
        </div>
        
        <div>
          <div style={{ color: 'var(--tg-theme-hint-color)' }}>Длительность</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {formatDuration(stats.duration)}
          </div>
        </div>
      </div>
    </div>
  );
} 