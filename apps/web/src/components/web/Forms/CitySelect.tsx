"use client";

import React, { useEffect, useState } from "react";

interface City {
  id: string;
  name: string;
}

interface CitySelectProps {
  countryId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CitySelect({
  countryId,
  value,
  onChange,
  placeholder = "Select city...",
  disabled = false,
  className = "w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none",
}: CitySelectProps & { className?: string }) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryId) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
      const url = `${baseUrl}/api/${apiVersion}/cities?countryId=${countryId}&page=1&limit=200`;
      try {
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        setCities(data.data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      } catch {
        setCities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, [countryId]);

  return (
    <select
      className={className}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled || loading || !countryId}
    >
      <option value="" disabled>{placeholder}</option>
      {cities.map(city => (
        <option key={city.id} value={city.id}>{city.name}</option>
      ))}
    </select>
  );
} 