"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Hospital } from "../types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface HospitalMapProps {
  hospitals: Hospital[];
}

export default function HospitalMap({ hospitals }: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!mapboxgl.accessToken) {
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [8.6753, 9.082],
      zoom: 5.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    hospitals.forEach((hospital) => {
      if (!hospital.location) return;

      const loc = hospital.location as {
        type?: string;
        coordinates?: [number, number];
      };

      if (!loc.coordinates) return;

      const el = document.createElement("div");
      el.className = "hospital-marker";
      el.style.cssText =
        "width:24px;height:24px;background:#2563eb;border-radius:50%;border:2px solid white;cursor:pointer;";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.coordinates[0], loc.coordinates[1]])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3 style="font-weight:bold">${hospital.name}</h3>
             <p>${hospital.city}, ${hospital.state}</p>
             <p>${hospital.phone}</p>`,
          ),
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [hospitals]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[450px] rounded-xl overflow-hidden"
    />
  );
}
