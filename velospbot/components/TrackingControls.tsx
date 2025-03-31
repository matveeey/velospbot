'use client'

type TrackingControlsProps = {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
  isLoading: boolean;
};

export default function TrackingControls({ isTracking, onStart, onStop, isLoading }: TrackingControlsProps) {
  // Общий стиль для кнопок
  const baseButtonStyle = {
    width: '100%', 
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  };

  // Стиль для кнопки "Начать отслеживание"
  const startButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--tg-theme-button-color)',
    color: 'var(--tg-theme-button-text-color)',
  };

  // Стиль для кнопки "Остановить отслеживание"
  const stopButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--tg-theme-button-color)',
    color: 'var(--tg-theme-button-text-color)',
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '1rem', 
      marginTop: '1rem' 
    }}>
      {!isTracking ? (
        <button 
          onClick={onStart} 
          disabled={isLoading} 
          style={startButtonStyle}
        >
          {isLoading ? 'Загрузка...' : 'Начать отслеживание'}
        </button>
      ) : (
        <button 
          onClick={onStop} 
          disabled={isLoading} 
          style={stopButtonStyle}
        >
          {isLoading ? 'Загрузка...' : 'Остановить отслеживание'}
        </button>
      )}
    </div>
  );
}
