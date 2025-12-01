class Loader {
  constructor() {
    this.list_of_stops = [];
    this.list_of_routes = [];

    this.latMin = Infinity;
    this.latMax = -Infinity;
    this.longMin = Infinity;
    this.longMax = -Infinity;

    this.stopsData = null;
    this.routesData = null;
  }

  preloadData() {
    this.stopsData = loadJSON("data/mbta_stops.json");
    this.routesData = loadJSON("data/mbta_routes.json");
  }

  loadStops(data) {
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
    for (let route of data.data) {
      let attr = route.attributes;
      let hexcolor = attr.color;
      let desc = attr.desc;
      let dir = attr.direction_names;
      let type = attr.type;
      let id = route.id;

      this.list_of_routes.push(new Routes(id, hexcolor, desc, dir, type));
    }
  }

  loadShapes() {
    for (let i = 0; i < this.list_of_routes.length; i++) {
      let name = this.list_of_routes[i].id;
      const file = `data/shapes/mbta_shapes_${name}.json`;

      loadJSON(file, (data) => {
        const shapeData = [];

        for (const shape of data.data) {
          const encoded = shape.attributes.polyline;
          const coords = polyline.decode(encoded);

          for (const [lat, lon] of coords) {
            this.latMin = min(this.latMin, lat);
            this.latMax = max(this.latMax, lat);
            this.longMin = min(this.longMin, lon);
            this.longMax = max(this.longMax, lon);
          }

          shapeData.push(coords);
        }

        let route = this.list_of_routes.find((r) => r.id === name);
        route.shape = shapeData;
      });
    }
  }

  // computeWorldGeometry(world) {
  //   for (const stop of this.list_of_stops) {
  //     stop.wx = world.mapLon(stop.longitude, this.longMin, this.longMax);
  //     stop.wy = world.mapLat(stop.latitude, this.latMin, this.latMax);
  //   }
  // }
}
