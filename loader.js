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
      const file = `data/shapes/mbta_shapes_${name}.json`;

      try {
        const resp = await fetch(file);
        if (!resp.ok) throw new Error(resp.status);
        const data = await resp.json();

        const shapeData = [];
        for (const shape of data.data) {
          const encoded = shape.attributes.polyline;
          const coords = polyline.decode(encoded); // decode once

          for (const [lat, lon] of coords) {
            this.latMin = min(this.latMin, lat);
            this.latMax = max(this.latMax, lat);
            this.longMin = min(this.longMin, lon);
            this.longMax = max(this.longMax, lon);
          }

          shapeData.push(coords);
        }

        route.shape = shapeData;
      } catch (e) {
        route.shape = [];
      }
    });

    await Promise.all(tasks);
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
      if (!route.shape || route.shape.length === 0) continue;

      for (const coords of route.shape) {
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
