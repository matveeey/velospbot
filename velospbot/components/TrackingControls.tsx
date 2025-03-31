'use client'

interface TrackingControlsProps {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  hasHistory: boolean;
}

export default function TrackingControls({ 
  isTracking, 
  onStart, 
  onStop, 
  onReset,
  hasHistory 
}: TrackingControlsProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '16px'
    }}>
      <button
        onClick={isTracking ? onStop : onStart}
        style={{
          flex: 1,
          padding: '12px 24px',
          borderRadius: '30px',
          border: 'none',
          backgroundColor: isTracking 
            ? 'var(--tg-theme-destructive-color)' 
            : 'var(--tg-theme-button-color)',
          color: 'var(--tg-theme-button-text-color)',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        {isTracking ? 'Остановить' : 'Начать отслеживание'}
      </button>
      
      {hasHistory && !isTracking && (
        <button
          onClick={onReset}
          style={{
            padding: '12px 24px',
            borderRadius: '30px',
            border: 'none',
            backgroundColor: 'var(--tg-theme-destructive-color)',
            color: 'var(--tg-theme-button-text-color)',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Сбросить
        </button>
      )}
    </div>
  );
} 