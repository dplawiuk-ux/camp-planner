import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Locate } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, onPositionChange }) {
  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ location, lat, lng, onChange }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(location || "");
  const [position, setPosition] = useState(
    lat && lng ? { lat, lng } : { lat: 37.7749, lng: -122.4194 } // Default to SF
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (location !== undefined) {
      setSearchQuery(location);
    }
  }, [location]);

  useEffect(() => {
    if (lat && lng) {
      setPosition({ lat, lng });
    }
  }, [lat, lng]);

  const handlePositionChange = (latlng) => {
    setPosition(latlng);
    onChange({
      location: searchQuery || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      location_lat: latlng.lat,
      location_lng: latlng.lng
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Use Nominatim (OpenStreetMap) geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPos);
        onChange({
          location: display_name,
          location_lat: newPos.lat,
          location_lng: newPos.lng
        });
        setSearchQuery(display_name);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setPosition(newPos);
          onChange({
            location: searchQuery || `${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`,
            location_lat: newPos.lat,
            location_lng: newPos.lng
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="location" className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-600" />
        {t('trip.location')}
      </Label>
      
      <div className="flex gap-2">
        <Input
          id="location"
          placeholder={t('trip.searchPlacePlaceholder', 'Search for a place...')}
          value={searchQuery}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearchQuery(newValue);
            onChange({
              location: newValue,
              location_lat: position.lat,
              location_lng: position.lng
            });
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          className="flex-1 h-11 border-slate-200"
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="h-11 bg-emerald-600 hover:bg-emerald-700"
        >
          <Search className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCurrentLocation}
          className="h-11"
          title={t('trip.useCurrentLocation', 'Use current location')}
        >
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-200 h-64">
        <MapContainer
          center={position}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>
      
      <p className="text-xs text-slate-500">
        {t('trip.mapInstructions', 'Click on the map to drop a pin or search for a location')}
      </p>
    </div>
  );
}