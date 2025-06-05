
import React, { useEffect, useRef } from 'react';
import { LocalSearchResult, UserLocation, Language } from '../types';

interface LocalResultsMapProps {
  results: LocalSearchResult[];
  userLocation: UserLocation | null;
  mapsApiKey: string; // API Key will be passed, though not directly used in this component if script is loaded globally
  language: Language;
}

const LocalResultsMap: React.FC<LocalResultsMapProps> = ({ results, userLocation, mapsApiKey, language }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null); // Changed from window.google.maps.Map
  const markersRef = useRef<google.maps.Marker[]>([]); // Changed from window.google.maps.Marker

  const S = {
    mapError: language === Language.Urdu ? "نقشہ لوڈ نہیں ہو سکا۔" : "Map could not be loaded.",
    locationDetails: language === Language.Urdu ? "تفصیلات" : "Details",
  };

  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.warn("Google Maps API not available yet or mapRef is null.");
      return;
    }

    // Determine center and zoom
    let mapCenter: google.maps.LatLngLiteral; // Changed from window.google.maps.LatLngLiteral
    let mapZoom = 12; // Default zoom

    if (userLocation) {
      mapCenter = { lat: userLocation.latitude, lng: userLocation.longitude };
      mapZoom = 14;
    } else if (results.length > 0 && results[0].latitude && results[0].longitude) {
      mapCenter = { lat: results[0].latitude, lng: results[0].longitude };
    } else {
      // Default to a central point in Pakistan if no location info
      mapCenter = { lat: 30.3753, lng: 69.3451 };
      mapZoom = 6;
    }
    
    // Initialize map if not already initialized
    if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: mapCenter,
            zoom: mapZoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'cooperative', // Better for touch devices
        });
    } else {
        // If map already exists, just update center and zoom
        googleMapRef.current.setCenter(mapCenter);
        googleMapRef.current.setZoom(mapZoom);
    }
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let validResultsWithCoords = 0;

    results.forEach(result => {
      if (result.latitude && result.longitude) {
        validResultsWithCoords++;
        const position = { lat: result.latitude, lng: result.longitude };
        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: result.name,
          animation: window.google.maps.Animation.DROP,
        });

        const infoWindowContent = `
          <div style="font-family: Inter, sans-serif; color: #333; ${language === Language.Urdu ? 'direction: rtl; text-align: right;' : ''}">
            <h4 style="font-weight: bold; margin-bottom: 4px; font-size: 1.1em; ${language === Language.Urdu ? 'font-family: Noto Nastaliq Urdu, serif;' : ''}">${result.name}</h4>
            <p style="font-size: 0.9em; margin-bottom: 2px;">${result.category}</p>
            <p style="font-size: 0.85em; color: #555;">${result.address}</p>
          </div>`;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoWindowContent,
          ariaLabel: result.name,
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });
        markersRef.current.push(marker);
        bounds.extend(position);
      }
    });

    // Adjust map bounds if there are markers
    if (validResultsWithCoords > 1 && googleMapRef.current) {
      googleMapRef.current.fitBounds(bounds);
    } else if (validResultsWithCoords === 1 && googleMapRef.current) {
        // If only one result, center on it and keep existing zoom (or set a closer one)
        googleMapRef.current.setCenter(bounds.getCenter());
        if(googleMapRef.current.getZoom() < 15) googleMapRef.current.setZoom(15);
    }


  }, [results, userLocation, language]); // mapsApiKey is not needed here as it's for script loading

  if (!window.google || !window.google.maps) {
    return <div className={`local-search-map-container flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ${language === Language.Urdu ? 'urdu-text' : ''}`}>{S.mapError} (API not loaded)</div>;
  }
  
  return <div ref={mapRef} className="local-search-map-container" aria-label={language === Language.Urdu ? "مقامی نتائج کا نقشہ" : "Map of local results"}></div>;
};

export default LocalResultsMap;
