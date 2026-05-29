"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Hospital } from "../types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface HospitalMapProps {
  hospitals: Hospital[];
}

export default function HospitalMap({ hospitals }: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [8.6753, 9.082],
      zoom: 5.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const markers = document.querySelectorAll(".hospital-marker");
    markers.forEach((m) => m.remove());

    hospitals.forEach((hospital) => {
      if (!hospital.location) return;

      const loc = hospital.location as {
        type: string;
        coordinates: [number, number];
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

      marker.getElement().addEventListener("click", () => {
        marker.togglePopup();
      });
    });
  }, [hospitals]);

  return (
    <div
      ref={mapContainer}
      className="w-full rounded-xl overflow-hidden hospital-map-container"
    />
  );
}

const styles = `
  .hospital-map-container {
    height: 450px;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
