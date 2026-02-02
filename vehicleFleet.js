class VehicleFleet {
  constructor(mbtaclient, world, input, loader, collider) {
    this.mbtaclient = mbtaclient;
    this.world = world;
    this.input = input;
    this.loader = loader;
    this.collider = collider;

    this.fleetById = new Map(); // id -> Vehicle
    this.fleet = [];
  }

  // async refreshAllVehicles() {
  //   try {
  //     const vehicleResp = await this.getAllVehicleData();
  //     for (const item of vehicleResp.data) {
  //       this.upsertVehicle(item);
  //     }
  //   } catch (err) {
  //     console.error("[VehicleFleet] error:", err);
  //   }
  // }

  // upsertVehicle(vehicleItem) {
  //   const id = vehicleItem.id;
  //   if (!id) return;

  //   let v = this.fleetById.get(id);
  //   if (!v) {
  //     v = new Vehicle();
  //     v.id = id;
  //     v.calculateTrainDimensions(this.world, this.input);

  //     // match map bounds
  //     v.latMax = this.loader.latMax;
  //     v.latMin = this.loader.latMin;
  //     v.longMax = this.loader.longMax;
  //     v.longMin = this.loader.longMin;

  //     this.fleetById.set(id, v);
  //     this.fleet.push(v);
  //   }

  //   v.setVehicleData(vehicleItem);
  // }

  getAllVehicleData() {
    return this.mbtaclient.getVehicleData();
  }

  setAllVehicleData() {
    this.getAllVehicleData()
      .then((vehicleResp) => {
        for (let i = 0; i < vehicleResp.data.length; i++) {
          const myVehicle = new Vehicle();
          // console.log(vehicleResp.data[i]);
          myVehicle.id = vehicleResp.data[i].id;
          myVehicle.calculateTrainDimensions(this.world, this.input);
          myVehicle.latMin = this.loader.latMin;
          myVehicle.latMax = this.loader.latMax;
          myVehicle.longMax = this.loader.longMax;
          myVehicle.longMin = this.loader.longMin;
          myVehicle.setVehicleData(vehicleResp.data[i]);
          myVehicle.setCarriages(this.world, this.loader, this.collider);
          this.fleet.push(myVehicle);
        }
      })
      .catch((err) => console.error("[VehicleFleet] error:", err));
  }

  getVehicleDataFromVehicleId(vehicleId) {
    // console.log("Fetching vehicle", vehicleId);
    return this.mbtaclient.getVehicleFromStopPredictions(vehicleId);
  }

  setVehicleIdsFromPredictionBatch(vehicleIds) {
    // console.log("[VehicleFleet] got vehicleIds:", vehicleIds);

    for (let id of vehicleIds) {
      const myVehicle = new Vehicle();
      myVehicle.id = id.id;
      myVehicle.calculateTrainDimensions(this.world, this.input);

      // to match the rest of the map
      myVehicle.latMax = this.loader.latMax;
      myVehicle.latMin = this.loader.latMin;
      myVehicle.longMax = this.loader.longMax;
      myVehicle.longMin = this.loader.longMin;

      this.getVehicleDataFromVehicleId(myVehicle.id)
        .then((vehicleResp) => {
          //   console.log("[VehicleFleet] vehicleResp:", vehicleResp);

          const vehicleData = vehicleResp.data?.[0];
          if (!vehicleData) {
            console.warn("[VehicleFleet] no data for vehicle", myVehicle.id);
            return;
          }

          myVehicle.setVehicleData(vehicleData);
          this.fleet.push(myVehicle);
          //   console.log(
          //     "[VehicleFleet] pushed vehicle to fleet. fleet size:",
          //     this.fleet.length
          //   );
        })
        .catch((err) => console.error("[VehicleFleet] error:", err));
    }
  }

  draw() {
    for (let vehicle of this.fleet) {
      vehicle.draw();
    }
  }
}
