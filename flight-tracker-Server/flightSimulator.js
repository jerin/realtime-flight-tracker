const { EventEmitter } = require("events");

// Helper: linear interpolation between two lat/lon points by fraction t [0..1]
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Create a route with N steps between origin and dest
function createRoute(origin, dest, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      lat: lerp(origin.lat, dest.lat, t),
      lon: lerp(origin.lon, dest.lon, t),
    });
  }
  return pts;
}

function bearing(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);

  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function createSimulator() {
  const ev = new EventEmitter();
  const origin = { lat: 49.1945, lon: -123.1775 }; // Vancouver YVR (example)
  const dest = { lat: 51.47, lon: -0.4543 }; // London Heathrow LHR (example)
  const steps = 150; // number of points along the path
  const route = createRoute(origin, dest, steps);

  let idx = 0;
  let interval = null;

  function emitPoint() {
    const current = route[idx];
    const next = route[idx + 1] || route[idx];
    if (!current) {
      // stop();
      restart()
      return;
    }
    const hdg = bearing(current.lat, current.lon, next.lat, next.lon);

    const payload = {
      flight: "SIM001",
      lat: parseFloat(current.lat.toFixed(6)),
      lon: parseFloat(current.lon.toFixed(6)),
      altitude: Math.round(35000 - (idx / route.length) * 10000),
      speed_kts: Math.round(430 + Math.sin(idx / 50) * 10),
      heading: hdg, // <-- UPDATE HERE
      timestamp: Date.now(),
    };

    ev.emit("point", payload);
    idx++;
  }

  function start() {
    if (interval) clearInterval(interval);
    interval = setInterval(emitPoint, 100); // 1 update/sec
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function restart() {
    idx = 0;
  }

  // auto-start
  start();

  return {
    on: (evName, fn) => ev.on(evName, fn),
    stop,
    restart,
  };
}

module.exports = { createSimulator };
