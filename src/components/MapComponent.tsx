'use client';

import { useEffect, useState } from 'react';
import { LocationData, Incident, Report } from '@/types';

interface MapComponentProps {
  incidents?: Incident[];
  reports?: Report[];
  selectedLocation?: LocationData | null;
  onSelectLocation?: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  interactiveSelect?: boolean;
}

export default function MapComponent({
  incidents = [],
  reports = [],
  selectedLocation,
  onSelectLocation,
  height = '400px',
  zoom = 12,
  interactiveSelect = false,
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L) return;

    // Center on Bengaluru default or selectedLocation
    const centerLat = selectedLocation?.latitude || 12.9569;
    const centerLng = selectedLocation?.longitude || 77.7011;

    const mapElement = document.getElementById('bharat-sentinel-map');
    if (!mapElement) return;

    // Check if map instance exists
    if ((mapElement as any)._leaflet_id) {
      (mapElement as any)._leaflet_id = null;
      mapElement.innerHTML = '';
    }

    const map = L.map('bharat-sentinel-map').setView([centerLat, centerLng], zoom);

    // Standard free OpenStreetMap tile layer (No API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Icons
    const createMarkerIcon = (color: string) => {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
    };

    // Render Incidents
    incidents.forEach((inc) => {
      let color = '#38BDF8'; // Blue medium
      if (inc.priorityScore?.priorityLevel === 'critical') color = '#EF4444'; // Red
      else if (inc.priorityScore?.priorityLevel === 'high') color = '#F59E0B'; // Amber
      else if (inc.status === 'verified_fixed') color = '#10B981'; // Green

      const marker = L.marker([inc.location.latitude, inc.location.longitude], {
        icon: createMarkerIcon(color),
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: ${color}; font-family: monospace;">
            ${inc.incidentNumber} &bull; ${inc.priorityScore?.priorityLevel.toUpperCase() || 'HIGH'}
          </div>
          <div style="font-weight: bold; font-size: 14px; margin-top: 2px; color: #f8fafc;">${inc.title}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">${inc.location.address}</div>
          <div style="margin-top: 8px; font-size: 11px;">
            <a href="/dashboard/complaints/${inc.id}" style="color: #38bdf8; font-weight: bold; text-decoration: underline;">View Full Case &rarr;</a>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    // Selected Location Pin for reporting form
    if (selectedLocation) {
      const pinMarker = L.marker([selectedLocation.latitude, selectedLocation.longitude], {
        icon: createMarkerIcon('#0284C7'),
      }).addTo(map);
      pinMarker.bindPopup('<b>Selected Location Pin</b><br/>' + selectedLocation.address).openPopup();
    }

    // Click handler for interactive location selection
    if (interactiveSelect && onSelectLocation) {
      map.on('click', (e: any) => {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
    };
  }, [mounted, L, incidents, selectedLocation, zoom, interactiveSelect]);

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400"
        style={{ height }}
      >
        <span className="text-sm">Loading Interactive GIS Map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl" style={{ height }}>
      <div id="bharat-sentinel-map" className="w-full h-full" />
    </div>
  );
}
