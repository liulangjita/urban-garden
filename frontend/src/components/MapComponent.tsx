import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { GardenCenter } from '../types';
import { useEffect } from 'react';

// Fix for default marker icon in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface MapComponentProps {
  gardens: GardenCenter[];
  center: { lat: number; lng: number };
  zoom: number;
}

function ChangeView({ center, zoom }: { center: { lat: number, lng: number }, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ gardens, center, zoom }: MapComponentProps) {
  return (
    <div className="w-full h-full relative bg-gray-100">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        {gardens.map((garden) => (
          <Marker 
            key={garden.id} 
            position={[garden.coordinates.lat, garden.coordinates.lng]}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-green-800">{garden.name}</h3>
                <p className="text-xs text-gray-500">{garden.address}</p>
                <div className="mt-2 text-xs font-bold text-green-700">
                  {garden.plots.length} 个可用地块
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Standard zoom controls positioned differently for mobile */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
         {/* Custom zoom buttons can be added here if needed */}
      </div>
    </div>
  );
}
