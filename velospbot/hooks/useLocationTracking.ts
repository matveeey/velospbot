import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface Stats {
  currentSpeed: number;
  medianSpeed: number;
  distance: number;
  duration: number;
}

interface LocationTrackingResult {
  error: string | null;
  currentLocation: LocationData | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  isTracking: boolean;
  stats: Stats;
  locationHistory: LocationData[];
  resetRoute: () => void;
  isLoading: boolean;
}

// Функция для получения пользовательского ID из Telegram mini app
function getTelegramUserId(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const telegram = (window as any).Telegram.WebApp;
    if (telegram && telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
      return telegram.initDataUnsafe.user.id.toString();
    }
    return null;
  } catch (err) {
    console.error('Ошибка при получении ID пользователя Telegram', err);
    return null;
  }
}

// Интерфейс для геолокации из API
interface ApiLocationData {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
}

// Преобразование геолокации из API в формат приложения
function convertApiLocationToAppLocation(apiLocation: ApiLocationData): LocationData {
  return {
    coords: {
      latitude: apiLocation.latitude,
      longitude: apiLocation.longitude,
      accuracy: apiLocation.accuracy || 0,
      altitude: apiLocation.altitude || null,
      altitudeAccuracy: null,
      heading: null,
      speed: apiLocation.speed || null
    },
    timestamp: apiLocation.timestamp
  };
}

export function useLocationTracking(): LocationTrackingResult {
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [stats, setStats] = useState<Stats>({
    currentSpeed: 0,
    medianSpeed: 0,
    distance: 0,
    duration: 0
  });
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = useRef<string | null>(null);

  // Вычисление расстояния между двумя точками
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Обновление статистики
  const updateStats = (location: LocationData) => {
    const speeds = locationHistory
      .map(loc => loc.coords.speed || 0)
      .filter(speed => speed > 0);
    
    const currentSpeed = location.coords.speed ? location.coords.speed * 3.6 : 0; // м/с в км/ч
    const medianSpeed = speeds.length > 0 
      ? speeds.sort((a, b) => a - b)[Math.floor(speeds.length / 2)] * 3.6 
      : 0;

    let distance = 0;
    if (locationHistory.length > 0) {
      const prevLocation = locationHistory[locationHistory.length - 1];
      distance = calculateDistance(
        prevLocation.coords.latitude,
        prevLocation.coords.longitude,
        location.coords.latitude,
        location.coords.longitude
      );
    }

    const duration = startTime.current 
      ? (Date.now() - startTime.current) / 1000 
      : 0;

    setStats(prev => ({
      currentSpeed,
      medianSpeed,
      distance: prev.distance + distance,
      duration
    }));
  };

  // Получение геолокации из API
  const fetchLocation = async () => {
    if (!userId.current) {
      setError('Не удалось определить ID пользователя Telegram');
      return;
    }

    try {
      const response = await axios.get(`/api/location/${userId.current}`);
      if (response.data) {
        const locationData = convertApiLocationToAppLocation(response.data);
        setCurrentLocation(locationData);
        setLocationHistory(prev => [...prev, locationData]);
        updateStats(locationData);
        setError(null);
      }
    } catch (err) {
      console.error('Ошибка при получении геолокации', err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Если локация не найдена, не показываем ошибку
        return;
      }
      setError('Ошибка при получении геолокации. Возможно, пользователь не отправлял свою геолокацию в бот.');
    }
  };

  // Получение истории геолокации из API
  const fetchLocationHistory = async () => {
    if (!userId.current) {
      return;
    }

    try {
      const response = await axios.get(`/api/location/${userId.current}/history`);
      if (response.data && Array.isArray(response.data)) {
        const locationDataArray = response.data.map(convertApiLocationToAppLocation);
        setLocationHistory(locationDataArray);
        
        if (locationDataArray.length > 0) {
          setCurrentLocation(locationDataArray[locationDataArray.length - 1]);
          // Обновляем статистику на основе полученной истории
          let totalDistance = 0;
          for (let i = 1; i < locationDataArray.length; i++) {
            const prev = locationDataArray[i - 1];
            const curr = locationDataArray[i];
            totalDistance += calculateDistance(
              prev.coords.latitude,
              prev.coords.longitude,
              curr.coords.latitude,
              curr.coords.longitude
            );
          }
          
          // Обновляем только расстояние, остальные показатели обновятся автоматически
          setStats(prev => ({
            ...prev,
            distance: totalDistance
          }));
        }
      }
    } catch (err) {
      console.error('Ошибка при получении истории геолокации', err);
    }
  };

  const startTracking = async () => {
    try {
      setIsLoading(true);
      
      // Получаем ID пользователя из Telegram mini app
      userId.current = getTelegramUserId();
      
      if (!userId.current) {
        setError('Не удалось определить ID пользователя Telegram. Убедитесь, что вы используете мини-приложение через Telegram.');
        setIsTracking(false);
        setIsLoading(false);
        return;
      }
      
      startTime.current = Date.now();
      
      // Получаем историю геолокации
      await fetchLocationHistory();
      
      // Начинаем регулярный опрос API
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
      
      pollInterval.current = setInterval(fetchLocation, 3000); // Опрос каждые 3 секунды
      setIsTracking(true);
      setIsLoading(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsTracking(false);
      setIsLoading(false);
    }
  };

  const stopTracking = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
    startTime.current = null;
    setIsTracking(false);
  };

  const resetRoute = () => {
    setLocationHistory([]);
    setStats({
      currentSpeed: 0,
      medianSpeed: 0,
      distance: 0,
      duration: 0
    });
  };

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  return {
    error,
    currentLocation,
    startTracking,
    stopTracking,
    isTracking,
    stats,
    locationHistory,
    resetRoute,
    isLoading
  };
} 