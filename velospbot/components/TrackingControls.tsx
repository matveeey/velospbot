'use client'

interface TrackingControlsProps {
	isTracking: boolean;
	onStart: () => void;
	onStop: () => void;
	onReset: () => void;
	hasHistory: boolean;
	isLoading: boolean;
}

export default function TrackingControls({ 
	isTracking, 
	onStart, 
	onStop, 
	onReset,
	hasHistory,
	isLoading 
}: TrackingControlsProps) {
  	return (
		<div style={{
		display: 'flex',
		gap: '16px',
		padding: '16px',
		minHeight: '72px',
		alignItems: 'center'
		}}>
		<button
			onClick={isTracking ? onStop : onStart}
			disabled={isLoading}
			style={{
				width: hasHistory ? 'calc(100% - 120px)' : '100%',
				padding: '12px 24px',
				borderRadius: '30px',
				border: 'none',
				backgroundColor: isLoading 
				? 'var(--tg-theme-hint-color)'
				: isTracking 
					? 'var(--tg-theme-destructive-color)' 
					: 'var(--tg-theme-button-color)',
				color: (isTracking && !isLoading) 
				? 'var(--tg-theme-button-text-color)' 
				: 'var(--tg-theme-button-text-color)',
				fontWeight: 'bold',
				fontSize: '16px',
				cursor: isLoading ? 'not-allowed' : 'pointer',
				transition: 'opacity 0.3s ease',
				opacity: isLoading ? 0.7 : 1,
				fontFamily: 'inherit',
				// Remove standart Telegram styles
				backgroundImage: 'none',
			}}
			>
			{isLoading ? 'Получение локации...' : isTracking ? 'Остановить' : 'Начать отслеживание'}
			</button>
		
		{hasHistory && !isTracking && (
			<button
				onClick={onReset}
				disabled={isLoading}
				style={{
					width: '104px',
					padding: '12px 24px',
					borderRadius: '30px',
					border: 'none',
					backgroundColor: 'var(--tg-theme-destructive-color)',
					color: 'var(--tg-theme-button-text-color)',
					fontWeight: 'bold',
					fontSize: '16px',
					cursor: 'pointer',
					transition: 'opacity 0.3s ease',
					opacity: isLoading ? 0.7 : 1,
					fontFamily: 'inherit',
					backgroundImage: 'none',
				}}
			>
				Сбросить
			</button>
		)}
		</div>
	);
} 