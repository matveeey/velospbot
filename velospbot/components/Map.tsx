'use client'

import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point, LineString } from 'ol/geom';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import 'ol/ol.css';

interface MapProps {
  center: [number, number];
  isTracking: boolean;
  locationHistory: Array<{coords: {latitude: number; longitude: number}}>;
}

export default function MapComponent({ center, isTracking, locationHistory }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Создаем слой для маркеров и линий
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#0066ff',
          width: 3
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: '#0066ff' }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        })
      })
    });
    vectorLayerRef.current = vectorLayer;

    // Создаем карту
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([center[1], center[0]]),
        zoom: 16
      })
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Обновляем позицию и маршрут при изменении данных
  useEffect(() => {
    if (!mapInstanceRef.current || !vectorLayerRef.current) return;

    const vectorSource = vectorLayerRef.current.getSource();
    if (!vectorSource) return;

    // Очищаем предыдущие объекты
    vectorSource.clear();

    // Добавляем текущую позицию
    const currentPoint = new Feature({
      geometry: new Point(fromLonLat([center[1], center[0]]))
    });
    vectorSource.addFeature(currentPoint);

    // Добавляем линию маршрута
    if (locationHistory.length > 1) {
      const coordinates = locationHistory.map(loc => 
        fromLonLat([loc.coords.longitude, loc.coords.latitude])
      );
      const routeLine = new Feature({
        geometry: new LineString(coordinates)
      });
      vectorSource.addFeature(routeLine);
    }

    // Центрируем карту на текущей позиции при отслеживании
    if (isTracking) {
      mapInstanceRef.current.getView().animate({
        center: fromLonLat([center[1], center[0]]),
        duration: 500
      });
    }
  }, [center, locationHistory, isTracking]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: '60vh', 
        width: '100%', 
        marginBottom: '1rem',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    />
  );
} 