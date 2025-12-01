class Vehicle {
  // im not sure what to do with this rn, but prob need this to fetch vehicle data later
  constructor() {
    this.id = 0;
    this.type = 0; // ?

    this.x = 0;
    this.y = 0;
    this.w = 2;
    this.h = 8;

    this.latMin = 0;
    this.latMax = 0;
    this.longMin = 0;
    this.longMax = 0; // temp, ill make this more elegant later

    this.bearing = 0; // 0 -> 359/360
    this.carriages = []; // idk if i need to make a class
    // label, occupancy_status, occupancy_percentage
    this.current_status = "";
    this.current_stop_sequence = 0;
    this.direction_id = 0; // bool 0/1
    this.label = "";
    this.latitude = 0;
    this.longitude = 0;
    this.occupancy_status = null;
    this.revenue = "";
    this.speed = null;
    this.updated_at = ""; // dt format ie, 2025-12-01T16:37:09-05:00

    this.relationships_route_id = ""; //color of vehicle
    this.relationships_stop_id = "";
    this.relationships_trip_id = "";
  }

  setVehicleData(data) {
    // console.log(data);
    if (!data) return;
    // console.log("wtf2");
    // top-level
    this.id = data.id ?? this.id;
    this.type = data.type ?? this.type;

    const attr = data.attributes || {};
    const rel = data.relationships || {};

    // attributes
    this.bearing = attr.bearing ?? this.bearing;
    this.carriages = Array.isArray(attr.carriages)
      ? attr.carriages
      : this.carriages;
    this.current_status = attr.current_status ?? this.current_status;
    this.current_stop_sequence =
      attr.current_stop_sequence ?? this.current_stop_sequence;
    this.direction_id = attr.direction_id ?? this.direction_id;
    this.label = attr.label ?? this.label;
    this.latitude = attr.latitude ?? this.latitude;
    this.longitude = attr.longitude ?? this.longitude;

    // console.log(attr.latitude);
    this.occupancy_status = attr.occupancy_status ?? this.occupancy_status;
    this.revenue = attr.revenue ?? this.revenue;
    this.speed = attr.speed ?? this.speed;
    this.updated_at = attr.updated_at ?? this.updated_at;

    // relationships
    this.relationships_route_id =
      rel.route?.data?.id ?? this.relationships_route_id;
    this.relationships_stop_id =
      rel.stop?.data?.id ?? this.relationships_stop_id;
    this.relationships_trip_id =
      rel.trip?.data?.id ?? this.relationships_trip_id;
  }

  draw() {
    this.x = map(this.longitude, this.longMin, this.longMax, 50, width - 50);
    this.y = map(this.latitude, this.latMax, this.latMin, 50, height - 50);

    // rect(this.x, this.y, this.w, this.h);

    // Convert MBTA bearing (nav-style) to p5 angle
    // MBTA: 0 = North (up), clockwise
    // p5:   0 = +X (right), counterclockwise
    let angleRad = radians(90 - this.bearing);

    push();
    translate(this.x, this.y);
    rotate(angleRad);

    // draw a little arrow pointing along +X in local space
    fill("red");

    const size = 1;
    beginShape();
    // tip pointing forward (+X)
    vertex(size, 0);
    // back bottom
    vertex(-size * 0.7, size * 0.5);
    // back top
    vertex(-size * 0.7, -size * 0.5);
    endShape(CLOSE);

    pop();
  }
}
