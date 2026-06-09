"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Hospital } from "../types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface HospitalMapProps {
  hospitals: Hospital[];
  onHospitalClick?: (id: string) => void;
}

export default function HospitalMap({
  hospitals,
  onHospitalClick,
}: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    if (!mapboxgl.accessToken) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
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

      const [lng, lat] = loc.coordinates;
      if (!lng || !lat || (lng === 0 && lat === 0)) return;

      const el = document.createElement("div");
      el.style.cssText =
        "width:24px;height:24px;background:#059669;border-radius:50%;border:2px solid white;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:box-shadow 0.15s ease;";

      el.addEventListener("mouseenter", () => {
        el.style.boxShadow =
          "0 0 0 6px rgba(5,150,105,0.3), 0 2px 6px rgba(0,0,0,0.3)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      });
      el.addEventListener("click", () => {
        onHospitalClick?.(hospital.id);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3 style="font-weight:bold;margin-bottom:4px">${hospital.name}</h3>
             <p style="margin:0;color:#666">${hospital.city}, ${hospital.state}</p>
             <p style="margin:4px 0 0;color:#666">${hospital.phone}</p>`,
          ),
        )
        .addTo(map.current!);

      markers.current.push(marker);

      if (hospitals.length === 1) {
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 13,
          duration: 1000,
        });
      }
    });
  }, [hospitals, onHospitalClick]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
