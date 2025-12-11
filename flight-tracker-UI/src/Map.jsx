import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createWS } from "./ws";

export default function FlightMap() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polyRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // create map
    mapRef.current = L.map("map", { center: [50, -30], zoom: 3 });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // plane marker divIcon with inner img so we can rotate via CSS
    const planeHtml = `<div class="plane-icon" style="transform: rotate(0deg);"><img src="/plane.svg" alt="plane" width="36" height="36"/></div>`;
    const planeIcon = L.divIcon({
      html: planeHtml,
      className: "none",
      iconSize: [36, 36],
      iconAnchor: [18, 18],      
    });

    markerRef.current = L.marker([0, 0], { icon: planeIcon }).addTo(
      mapRef.current
    );
    polyRef.current = L.polyline([], { weight: 2 }).addTo(mapRef.current);

    // connect websocket
    const ws = createWS("ws://localhost:8080", (msg) => {
      setConnected(true);
      // expect msg to be {lat, lon, heading?, flight, ...}
      const lat = msg.lat;
      const lon = msg.lon;

      // move marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);

        // rotate inner div
        try {
          const el = markerRef.current.getElement();
          if (el) {
            const inner = el.querySelector(".plane-icon");
            if (inner) inner.style.transform = `rotate(${msg.heading || 0}deg)`;
          }
        } catch (e) {
          // ignore
        }
      }

      // add to polyline (trail)
      if (polyRef.current) {
        const latlngs = polyRef.current.getLatLngs();
        latlngs.push([lat, lon]);
        polyRef.current.setLatLngs(latlngs);
      }

      // center map to marker (optional: only when zoomed out)
      const z = mapRef.current.getZoom();
      if (z < 6) {
        mapRef.current.panTo([lat, lon], { animate: true, duration: 0.8 });
      }
    });

    ws.addEventListener("open", () => setConnected(true));
    ws.addEventListener("close", () => setConnected(false));

    return () => {
      ws.close();
      mapRef.current.remove();
    };
  }, []);

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div id="map" style={{ height: "100%" }} />
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          padding: 8,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 6,
        }}
      >
        <div>WS: {connected ? "connected" : "disconnected"}</div>
        <small>Demo uses simulated route YVR → LHR</small>
      </div>
    </div>
  );
}
