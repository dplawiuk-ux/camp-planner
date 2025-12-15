import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TripMap({ location, lat, lng }) {
  if (!lat || !lng) {
    return null;
  }

  const position = { lat, lng };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border border-slate-200 h-64 mb-3">
          <MapContainer
            center={position}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{location}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <p className="text-sm text-slate-600">{location}</p>
      </CardContent>
    </Card>
  );
}