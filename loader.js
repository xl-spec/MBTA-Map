class Loader {
  constructor() {
    this.list_of_stops = [];
    this.list_of_routes = [];
    this.routesById = new Map();

    this.latMin = Infinity;
    this.latMax = -Infinity;
    this.longMin = Infinity;
    this.longMax = -Infinity;

    this.stopsData = null;
    this.routesData = null;
  }

  async preloadData() {
    // fetch in parallel
    const [stopsResp, routesResp] = await Promise.all([
      fetch("data/mbta_stops.json"),
      fetch("data/mbta_routes.json"),
    ]);

    if (!stopsResp.ok || !routesResp.ok) {
      throw new Error("Failed to preload stops or routes");
    }

    // parse JSON in parallel
    const [stopsData, routesData] = await Promise.all([
      stopsResp.json(),
      routesResp.json(),
    ]);

    this.stopsData = stopsData;
    this.routesData = routesData;
  }

  loadStops(data) {
    // console.log(data);
    for (let stop of data.data) {
      let attr = stop.attributes;

      let newStop = new Stops({
        name: attr.name,
        latitude: attr.latitude,
        longitude: attr.longitude,

        address: attr.address,
        at_street: attr.at_street,
        description: attr.description,
        location_type: attr.location_type,
        municipality: attr.municipality,
        on_street: attr.on_street,
        platform_code: attr.platform_code,
        platform_name: attr.platform_name,
        vehicle_type: attr.vehicle_type,
        wheelchair_boarding: attr.wheelchair_boarding,
        id: stop.id,
      });

      this.list_of_stops.push(newStop);

      // update min/max
      if (attr.latitude != null && attr.longitude != null) {
        this.latMin = Math.min(this.latMin, attr.latitude);
        this.latMax = Math.max(this.latMax, attr.latitude);
        this.longMin = Math.min(this.longMin, attr.longitude);
        this.longMax = Math.max(this.longMax, attr.longitude);
      }
    }
  }

  loadRoutes(data) {
    for (const route of data.data) {
      const newRoute = new Routes(route);
      this.list_of_routes.push(newRoute);
      this.routesById.set(newRoute.id, newRoute);
    }
  }

  getRouteById(id) {
    return this.routesById.get(id) || null;
  }

  async loadShapesAsync() {
    const tasks = this.list_of_routes.map(async (route) => {
      const name = route.id;
      // const file = `data/shapes/mbta_shapes_${name}.json`;
      const file = `data/shapes_filtered/mbta_shapes_${name}.json`;

      try {
        const resp = await fetch(file);

        // file missing → just skip this route
        if (!resp.ok) {
          // optional: console.warn(`No shape file for route ${name}`);
          return;
        }

        const data = await resp.json();

        for (const i of data.data) {
          const encoded = i.attributes.polyline;
          const coords = polyline.decode(encoded);

          for (const [lat, lon] of coords) {
            this.latMin = min(this.latMin, lat);
            this.latMax = max(this.latMax, lat);
            this.longMin = min(this.longMin, lon);
            this.longMax = max(this.longMax, lon);
          }

          // route.addShapes(i.id, coords);
          const direction_id = i.direction_id ?? null;
          const line = i.line ?? null;
          const direction = i.direction ?? null;

          route.addShapes(i.id, coords, direction_id, line, direction);
          // console.log(coords);
        }
      } catch (err) {}
    });

    await Promise.all(tasks);
  }

  async densifyAllRoutesAsync(stepMeters, world) {
    for (const route of this.list_of_routes) {
      // clear previous densified shapes
      route.customShape = [];

      for (const shapeObj of route.shapes) {
        const coords = shapeObj.coordinates; // [[lat, lon], ...]
        const densified = this.densifyLatLonSimple(coords, stepMeters, world);

        // preserve ALL metadata
        route.addCustomShapes(
          shapeObj.shapeID,
          densified,
          shapeObj.direction_id ?? null,
          shapeObj.line ?? null,
          shapeObj.direction ?? null,
        );
      }
    }
  }

  densifyLatLonSimple(coords, stepMeters, world) {
    if (!coords || coords.length < 2) return coords;
    const out = [];
    const EPS = 0.01; // meters

    for (let i = 0; i < coords.length - 1; i++) {
      const [lat0, lon0] = coords[i];
      const [lat1, lon1] = coords[i + 1];

      // keep segment start (avoid dup)
      if (out.length === 0) out.push([lat0, lon0]);
      else {
        const p = out[out.length - 1];
        if (world.haversineMeters(p[0], p[1], lat0, lon0) > EPS)
          out.push([lat0, lon0]);
      }

      const segLen = world.haversineMeters(lat0, lon0, lat1, lon1);
      if (segLen <= EPS) continue;

      const n = Math.floor(segLen / stepMeters);

      for (let j = 1; j <= n; j++) {
        const dist = j * stepMeters;
        if (dist >= segLen) break;
        const t = dist / segLen;
        out.push([lat0 + (lat1 - lat0) * t, lon0 + (lon1 - lon0) * t]);
      }
      // console.log("simpl");
    }

    // keep final endpoint
    const last = coords[coords.length - 1];
    const lastOut = out[out.length - 1];
    if (world.haversineMeters(lastOut[0], lastOut[1], last[0], last[1]) > EPS) {
      out.push([last[0], last[1]]);
    }

    return out;
  }

  computeWorldGeometry(world) {
    // stops
    for (const stop of this.list_of_stops) {
      if (stop.latitude == null || stop.longitude == null) continue;
      stop.wx = map(stop.longitude, this.longMin, this.longMax, 50, width - 50);
      stop.wy = map(stop.latitude, this.latMax, this.latMin, 50, height - 50);
    }

    // routes
    for (const route of this.list_of_routes) {
      route.worldShape = [];
      if (!route.customShape || route.customShape.length === 0) continue;

      for (const shapeObj of route.customShape) {
        const coords = shapeObj.coordinates;
        const poly = [];
        for (const [lat, lon] of coords) {
          const x = map(lon, this.longMin, this.longMax, 50, width - 50);
          const y = map(lat, this.latMax, this.latMin, 50, height - 50);
          poly.push({ x, y });
        }
        if (poly.length > 1) route.worldShape.push(poly);
      }
    }
  }
}
