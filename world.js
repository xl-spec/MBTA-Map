class World {
  constructor(x = 0, y = 0, w = 800, h = 800) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.latMin = Infinity;
    this.latMax = -Infinity;
    this.longMin = Infinity;
    this.longMax = -Infinity;
  }

  getLocalMinMax(loaderObj) {
    this.latMin = loaderObj.latMin;
    this.latMax = loaderObj.latMax;
    this.longMin = loaderObj.longMin;
    this.longMax = loaderObj.longMax;
  }

  setScreenBounds(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  // ---------- lat/lon <-> world (map space, BEFORE pan/zoom) ----------

  latLonToWorld(lat, lon) {
    // same mapping you used in draw:
    // x: map(lon, longMin, longMax, 50, width - 50)
    // y: map(lat, latMax, latMin, 50, height - 50)
    const wx = map(lon, this.longMin, this.longMax, this.x, this.x + this.w);
    const wy = map(lat, this.latMax, this.latMin, this.y, this.y + this.h);
    return createVector(wx, wy);
  }

  worldToLatLon(wx, wy) {
    const lon = map(wx, this.x, this.x + this.w, this.longMin, this.longMax);
    const lat = map(wy, this.y, this.y + this.h, this.latMax, this.latMin);
    return { lat, lon };
  }

  // ---------- world <-> screen (pan/zoom applied) ----------

  worldToScreen(wx, wy, inputHandler) {
    return createVector(
      wx * inputHandler.zoomNum + inputHandler.offset.x,
      wy * inputHandler.zoomNum + inputHandler.offset.y
    );
  }

  screenToWorld(sx, sy, inputHandler) {
    return createVector(
      (sx - inputHandler.offset.x) / inputHandler.zoomNum,
      (sy - inputHandler.offset.y) / inputHandler.zoomNum
    );
  }

  // ---------- lat/lon <-> screen convenience ----------

  latLonToScreen(lat, lon, inputHandler) {
    const w = this.latLonToWorld(lat, lon);
    return this.worldToScreen(w.x, w.y, inputHandler);
  }

  screenToLatLon(sx, sy, inputHandler) {
    const w = this.screenToWorld(sx, sy, inputHandler);
    const { lat, lon } = this.worldToLatLon(w.x, w.y);
    return {
      lat,
      lon,
      wx: w.x,
      wy: w.y,
    };
  }

  haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const dφ = toRad(lat2 - lat1);
    const dλ = toRad(lon2 - lon1);

    const a =
      Math.sin(dφ / 2) * Math.sin(dφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) * Math.sin(dλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  screenDistanceMeters(sx1, sy1, sx2, sy2, inputHandler) {
    const p1 = this.screenToLatLon(sx1, sy1, inputHandler);
    const p2 = this.screenToLatLon(sx2, sy2, inputHandler);
    return this.haversineMeters(p1.lat, p1.lon, p2.lat, p2.lon);
  }
  screenDistanceMiles(sx1, sy1, sx2, sy2, inputHandler) {
    return (
      this.screenDistanceMeters(sx1, sy1, sx2, sy2, inputHandler) / 1609.344
    );
  }
}
