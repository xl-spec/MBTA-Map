class World {
  constructor(x = 0, y = 0, w = 800, h = 800) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  mapLon(lon, minLon, maxLon) {
    return map(lon, minLon, maxLon, this.x, this.x + this.w);
  }

  mapLat(lat, minLat, maxLat) {
    return map(lat, maxLat, minLat, this.y, this.y + this.h);
  }
}
