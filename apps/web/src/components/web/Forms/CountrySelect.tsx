"use client";

import React, { useEffect, useState } from "react";

interface Country {
  id: string;
  name: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country...",
  className = "w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none",
}: CountrySelectProps & { className?: string }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
      const url = `${baseUrl}/api/${apiVersion}/countries?page=1&limit=200`;
      try {
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        console.log("data ========>", data);
        setCountries(data.data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      } catch {
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  return (
    <select
      className={className}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={loading}
    >
      <option value="" disabled>{placeholder}</option>
      {countries.map(country => (
        <option key={country.id} value={country.id}>{country.name}</option>
      ))}
    </select>
  );
}
