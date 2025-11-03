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
      let lat = attr.latitude;
      let lon = attr.longitude;
      let name = attr.name;

      this.list_of_stops.push(new Stops(name, lat, lon));

      if (lat != null && lon != null) {
        this.latMin = Math.min(this.latMin, lat);
        this.latMax = Math.max(this.latMax, lat);
        this.longMin = Math.min(this.longMin, lon);
        this.longMax = Math.max(this.longMax, lon);
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
}
