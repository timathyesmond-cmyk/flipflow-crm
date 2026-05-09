import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const stageColors = {
  lead: '#94a3b8',
  contacted: '#3b82f6',
  under_contract: '#f59e0b',
  assigned: '#8b5cf6',
  closed: '#10b981',
  dead: '#ef4444',
};

const stageLabels = {
  lead: 'Lead', contacted: 'Contacted', under_contract: 'Under Contract',
  assigned: 'Assigned', closed: 'Closed', dead: 'Dead',
};

function createColoredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

async function geocodeAddress(address, city, state, zip) {
  const query = [address, city, state, zip].filter(Boolean).join(', ');
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=us&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

export default function DealsMap() {
  const [markers, setMarkers] = useState([]);
  const [geocoding, setGeocoding] = useState(false);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date'),
  });

  useEffect(() => {
    if (!deals.length) return;

    async function geocodeAll() {
      setGeocoding(true);
      const results = [];
      for (const deal of deals) {
        if (!deal.property_address) continue;
        // Small delay to respect Nominatim rate limit
        await new Promise(r => setTimeout(r, 300));
        const coords = await geocodeAddress(deal.property_address, deal.city, deal.state, deal.zip);
        if (coords) results.push({ deal, ...coords });
      }
      setMarkers(results);
      setGeocoding(false);
    }

    geocodeAll();
  }, [deals]);

  const stageCounts = deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6" /> Deals Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {geocoding
              ? `Locating deals… (${markers.length} of ${deals.filter(d => d.property_address).length} done)`
              : `${markers.length} deal${markers.length !== 1 ? 's' : ''} mapped`}
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <div key={stage} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full border-2 border-white shadow" style={{ background: stageColors[stage] || '#94a3b8' }} />
              {stageLabels[stage] || stage} ({count})
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: '65vh' }}>
        {geocoding && markers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 bg-muted/30">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Geocoding addresses…</p>
          </div>
        ) : (
          <MapContainer
            center={[39.5, -98.35]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map(({ deal, lat, lng }) => (
              <Marker
                key={deal.id}
                position={[lat, lng]}
                icon={createColoredIcon(stageColors[deal.stage] || '#94a3b8')}
              >
                <Popup>
                  <div className="text-sm space-y-1 min-w-[180px]">
                    <p className="font-semibold leading-snug">{deal.property_address}</p>
                    <p className="text-gray-500 text-xs">{[deal.city, deal.state, deal.zip].filter(Boolean).join(', ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: stageColors[deal.stage] || '#94a3b8' }}>
                        {stageLabels[deal.stage] || deal.stage}
                      </span>
                      {deal.assignment_fee > 0 && (
                        <span className="text-xs text-green-600 font-semibold">${deal.assignment_fee.toLocaleString()}</span>
                      )}
                    </div>
                    <a href={`/deals/${deal.id}`} className="block text-xs text-blue-600 hover:underline mt-1">View deal →</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}