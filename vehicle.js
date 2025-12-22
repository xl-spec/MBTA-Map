class Vehicle {
  constructor() {
    this.id = 0;
    this.type = 0; // ?

    this.x = 0;
    this.y = 0;
    this.w = 80; // all trains same size for now
    this.h = 10;

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
    if (!data) return;
    this.id = data.id ?? this.id;
    this.type = data.type ?? this.type;

    const attr = data.attributes || {};
    const rel = data.relationships || {};

    // attributes
    this.bearing = attr.bearing ?? this.bearing;
    this.carriages = [];

    for (let i = 0; i < attr.carriages.length; i++) {
      let newCarriage = new Carriage();
      newCarriage.label = attr.carriages[i]["label"];
      newCarriage.occupancy_status = attr.carriages[i]["occupancy_status"];
      newCarriage.occupancy_percentage =
        attr.carriages[i]["occupancy_percentage"];
      this.carriages.push(newCarriage);
    }

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
    // temp fix for different green line colors... comeback when i refactor everything
    this.relationships_route_id =
      rel.route?.data?.id ?? this.relationships_route_id;
    // if (this.relationships_route_id == "Green-B") {
    //   this.relationships_route_id = "#00ff00";
    // }
    // if (this.relationships_route_id == "Green-C") {
    //   this.relationships_route_id = "#00c800";
    // }
    // if (this.relationships_route_id == "Green-D") {
    //   this.relationships_route_id = "#009600";
    // }
    // if (this.relationships_route_id == "Green-E") {
    //   this.relationships_route_id = "#006400";
    // }

    this.relationships_stop_id =
      rel.stop?.data?.id ?? this.relationships_stop_id;
    this.relationships_trip_id =
      rel.trip?.data?.id ?? this.relationships_trip_id;
  }

  calculateTrainDimensions(world) {
    const FEET_TO_METERS = 0.3048;
    const lengthM = 80 * FEET_TO_METERS; // along the track
    const widthM = 10 * FEET_TO_METERS;

    // approximate scale of the world in meters per world-unit
    const latCenter = 0.5 * (this.latMin + this.latMax);

    // horizontal distance of the whole map at center latitude
    const worldWidthMeters = world.haversineMeters(
      latCenter,
      world.longMin,
      latCenter,
      world.longMax
    );

    // vertical distance of the whole map at some longitude
    const worldHeightMeters = world.haversineMeters(
      world.latMin,
      world.longMin,
      world.latMax,
      world.longMin
    );

    const metersPerWorldX = worldWidthMeters / world.w;
    const metersPerWorldY = worldHeightMeters / world.h;

    // final world-space rectangle size (before zoom)
    this.w = lengthM / metersPerWorldX;
    this.h = widthM / metersPerWorldY;
  }

  setCarriages(world, loader, collider) {}

  draw() {
    // Lead vehicle position (already world-mapped)
    this.x = map(this.longitude, this.longMin, this.longMax, 50, width - 50);
    this.y = map(this.latitude, this.latMax, this.latMin, 50, height - 50);

    // --- draw lead vehicle ---
    push();
    translate(this.x, this.y);
    fill(this.relationships_route_id);
    rectMode(CENTER);
    rect(0, 0, this.w * 5, this.h * 5);
    pop();

    // for (const c of this.carriages) {
    //   push();
    //   translate(c.x, c.y);
    //   fill(fillColor);
    //   rectMode(CENTER);
    //   rect(0, 0, this.w * 40, this.h * 40);
    //   pop();
    // }
  }
}

class Carriage {
  constructor() {
    this.label = "";
    this.occupancy_status = "";
    this.occupancy_percentage = "";

    this.latitude = 0;
    this.longitude = 0;
    this.x = 0;
    this.y = 0;
    this.w = 80;
    this.h = 10;
  }
}
