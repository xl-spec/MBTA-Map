let list_of_stops = [];
let list_of_routes = [];
let latMin = Infinity;
let latMax = -Infinity;
let longMin = Infinity;
let longMax = -Infinity;

function loadStops() {
  loadJSON("data/mbta_stops.json", (data) => {
    for (let stop of data.data) {
      let attr = stop.attributes;
      let lat = attr.latitude;
      let lon = attr.longitude;
      let name = attr.name;

      list_of_stops.push(new Stops(name, lat, lon));

      if (lat != null && lon != null) {
        // avoiding zero min/max
        latMin = Math.min(latMin, lat);
        latMax = Math.max(latMax, lat);
        longMin = Math.min(longMin, lon);
        longMax = Math.max(longMax, lon);
      }
    }
  });
}

function loadRoutes() {
  loadJSON("data/mbta_routes.json", (data) => {
    for (let route of data.data) {
      let attr = route.attributes;
      let hexcolor = attr.color;
      let desc = attr.desc;
      let dir = attr.direction_names;
      let type = attr.type;
      let id = route.id;

      list_of_routes.push(new Routes(id, hexcolor, desc, dir, type));
    }
  });
}

function setup() {
  createCanvas(1400, 800);
  loadStops();
}

function draw() {
  background(220);
  for (let stop of list_of_stops) {
    circle((stop.latitude - latMin) * 500, (stop.longitude - longMin) * 500, 1);
  }
}

class Stops {
  letructor(name, latitude, longitude, type) {
    this.name = name;
    this.latitude = latitude; // some lat/long has nulls
    this.longitude = longitude;
    this.type = type; // prob a list
  }
}

class Routes {
  letructor(id, hexcolor, description, direction_names, type) {
    this.id = id; // green, blue, b, silver, etc
    this.hexcolor = hexcolor;
    this.description = description; // type of vehicle
    this.direction_names = direction_names; // list of either out/in, south/west, north/east
    this.type = type; // 0 - 4, more in notes.txt
  }
}
