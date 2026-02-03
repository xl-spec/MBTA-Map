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
    this.carriages = []; // label, occupancy_status, occupancy_percentage
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
    this.color = ""; // do later
    // this.tester = [];
    this.closestLatLon = null; // [lat, lon]
    this.behindLatLon = null; // [lat, lon]
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

  computeWorldDimensionsFromFeet(widthFeet, heightFeet, world) {
    const latCenter = 0.5 * (world.latMin + world.latMax);

    const worldWidthMeters = world.haversineMeters(
      latCenter,
      world.longMin,
      latCenter,
      world.longMax,
    );

    const worldHeightMeters = world.haversineMeters(
      world.latMin,
      world.longMin,
      world.latMax,
      world.longMin,
    );

    const metersPerWorldX = worldWidthMeters / world.w;
    const metersPerWorldY = worldHeightMeters / world.h;

    const FEET_TO_METERS = 0.3048;

    return {
      w: (widthFeet * FEET_TO_METERS) / metersPerWorldX,
      h: (heightFeet * FEET_TO_METERS) / metersPerWorldY,
    };
  }

  calculateTrainDimensions(world) {
    const dims = this.computeWorldDimensionsFromFeet(80, 10, world);
    // console.log(this.computeWorldDimensionsFromFeet(90, 90, world));
    this.w = dims.w;
    this.h = dims.h;
  }

  setCarriages(world, loader, collider) {
    let temp_latitude = this.latitude;
    let temp_longitude = this.longitude;

    let routeId = this.routeId || this.relationships_route_id;
    let route = loader.getRouteById(routeId);
    if (!route?.customShape?.length) return;

    let taken_shape = null; // fix this later, idk why vehicle doesnt show which destination
    for (const s of route.customShape) {
      if (s.direction_id === this.direction_id) {
        taken_shape = s.coordinates;
        break;
      }
    }
    // console.log(this.carriages.length);
    // console.log(this.carriages);
    // console.log(taken_shape);
    for (let i = 0; i < this.carriages.length; i++) {
      const res = collider.closestPointAndBehind(
        taken_shape,
        temp_longitude,
        temp_latitude,
        world,
        0.15,
      );
      // console.log(res);
      if (!res) break;
      // console.log(res);
      this.carriages[i].latitude = res.closest[0];
      this.carriages[i].longitude = res.closest[1];

      temp_latitude = res.behind[0];
      temp_longitude = res.behind[1];
    }
    // console.log("-");
    // console.log(this.carriages);
    // console.log("------------");
    // for (let c in this.carriages) {
    //   console.log(c.);
    // }
  }

  draw() {
    // Lead vehicle position (already world-mapped)
    this.x = map(this.longitude, this.longMin, this.longMax, 50, width - 50);
    this.y = map(this.latitude, this.latMax, this.latMin, 50, height - 50);
    // --- draw lead vehicle ---
    push();
    translate(this.x, this.y);
    // console.log(String(this.longitude) + " " + String(this.latitude));
    fill(this.relationships_route_id);
    rectMode(CENTER);
    // rect(0, 0, this.w * 5, this.h * 5);
    // console.log(this.w);
    rect(0, 0, this.w, this.h);

    // stroke(this.relationships_route_id);
    // noFill();
    // circle(0, 0, this.w * 2.1);
    pop();
    let circle_size = 0.15;
    for (const c of this.carriages) {
      c.x = map(c.longitude, this.longMin, this.longMax, 50, width - 50);
      c.y = map(c.latitude, this.latMax, this.latMin, 50, height - 50);
      push();
      translate(c.x, c.y);
      // fill(fillColor);
      fill(0, 0, 100, 30);
      rectMode(CENTER);
      // rect(0, 0, this.w, this.h);
      circle(0, 0, circle_size);
      pop();
      // circle_size *= 1.7;
    }
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
