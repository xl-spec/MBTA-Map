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

    // drawing / shapes
    this.shape = []; // keep if you already depend on it
    this.drawSize = 1;
  }

  adjustHexColor() {
    if (this.color == "FFC72C") {
      this.color == "";
    }
  }

  // getDrawSize() {
  //   pass;
  // }
}
