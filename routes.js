class Routes {
  constructor(routeJson) {
    // raw json
    this.raw = routeJson;

    // top-level MBTA route fields
    this.id = routeJson.id;
    this.type = routeJson.type; // should be "route" string in JSONAPI, but keep it if you want

    this.links = routeJson.links ?? null;
    this.relationships = routeJson.relationships ?? null;

    // attributes (THIS is the real route data)
    const a = routeJson.attributes ?? {};

    this.color = a.color ?? null; // e.g. "DA291C"
    this.text_color = a.text_color ?? null; // e.g. "FFFFFF"
    this.description = a.description ?? null; // e.g. "Rapid Transit"
    this.fare_class = a.fare_class ?? null; // e.g. "Rapid Transit"
    this.listed_route = a.listed_route ?? null; // boolean
    this.long_name = a.long_name ?? null; // e.g. "Red Line"
    this.short_name = a.short_name ?? null; // e.g. "B"
    this.sort_order = a.sort_order ?? null; // number
    this.route_type = a.type ?? null; // 0-4 (what you were using before)
    this.direction_names = a.direction_names ?? []; // ["South","North"]
    this.direction_destinations = a.direction_destinations ?? []; // ["Ashmont/Braintree","Alewife"]

    // this.shapeID = "";
    // this.shape = [];

    // this.drawSize = 1;
    this.customShape = [];
    this.shapes = [];
  }

  adjustHexColor() {
    if (this.color == "FFC72C") {
      this.color = "";
    }
  }

  addShapes(
    id,
    coordinates,
    direction_id = null,
    line = null,
    direction = null,
  ) {
    this.shapes.push(new Shape(id, coordinates, direction_id, line, direction));
  }

  addCustomShapes(
    id,
    coordinates,
    direction_id = null,
    line = null,
    direction = null,
  ) {
    this.customShape.push(
      new Shape(id, coordinates, direction_id, line, direction),
    );
  }

  // getDrawSize() {
  //   pass;
  // }
}

class Shape {
  constructor(
    shapeID,
    coordinates,
    direction_id = null,
    line = null,
    direction = null,
  ) {
    this.shapeID = shapeID;
    this.coordinates = coordinates;
    this.drawSize = 1;

    this.direction_id = direction_id; // 0/1
    this.line = line; // "Green-E"
    this.direction = direction; // "heath street -> medford/tufts"
  }
}
