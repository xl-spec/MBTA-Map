class VehicleFleet {
  constructor(mbtaclient, world, input) {
    this.mbtaclient = mbtaclient;
    this.world = world;
    this.input = input;
    this.fleet = [];

    this.latMax = 0;
    this.latMin = 0;
    this.longMax = 0;
    this.longMin = 0;
  }

  getAllVehicleData() {
    return this.mbtaclient.getVehicleData();
  }

  setAllVehicleData() {
    this.getAllVehicleData()
      .then((vehicleResp) => {
        for (let i = 0; i < vehicleResp.data.length; i++) {
          //   console.log(vehicleResp.data[i].id);

          const myVehicle = new Vehicle();
          myVehicle.id = vehicleResp.data[i].id;
          myVehicle.calculateTrainDimensions(this.world, this.input);
          myVehicle.latMax = this.latMax;
          myVehicle.latMin = this.latMin;
          myVehicle.longMax = this.longMax;
          myVehicle.longMin = this.longMin;
          myVehicle.setVehicleData(vehicleResp.data[i]);
          this.fleet.push(myVehicle);
        }
        // for ()
        // const myVehicle = new Vehicle();
        // myVehicle.setVehicleData(vehicleData);
        // this.fleet.push(myVehicle);
      })
      .catch((err) => console.error("[VehicleFleet] error:", err));
  }

  //  need to try catch the get, then process it with the loop length of data
  // let allVehicleData = this.getAllVehicleData();
  // console.log(allVehicleData);
  // for (let id of allVehicleData) {
  // for (let i = 0; i < allVehicleData.length; i++) {
  //   console.log(allVehicleData.i);
  //   this.getVehicleDataFromVehicleId(myVehicle.id)
  //     .then((vehicleResp) => {
  //       //   console.log("[VehicleFleet] vehicleResp:", vehicleResp);
  //       const vehicleData = vehicleResp.data?.[0];
  //       if (!vehicleData) {
  //         console.warn("[VehicleFleet] no data for vehicle", myVehicle.id);
  //         return;
  //       }
  //       this.fleet.push(myVehicle);
  //     })
  //     .catch((err) => console.error("[VehicleFleet] error:", err));
  // }

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
      myVehicle.latMax = this.latMax;
      myVehicle.latMin = this.latMin;
      myVehicle.longMax = this.longMax;
      myVehicle.longMin = this.longMin;

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
      //   console.log(vehicle.x);
      //   console.log(vehicle.y);
    }
  }
}
