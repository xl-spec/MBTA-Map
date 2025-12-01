class VehicleFleet {
  constructor(mbtaclient) {
    this.mbtaclient = mbtaclient;
    this.fleet = [];

    this.latMax = 0;
    this.latMin = 0;
    this.longMax = 0;
    this.longMin = 0;
  }

  getVehicleDataFromVehicleId(vehicleId) {
    console.log("Fetching vehicle", vehicleId);
    return this.mbtaclient.getVehicleFromStopPredictions(vehicleId);
  }

  setVehicleIdsFromPredictionBatch(vehicleIds) {
    console.log("[VehicleFleet] got vehicleIds:", vehicleIds);

    for (let id of vehicleIds) {
      const myVehicle = new Vehicle();
      myVehicle.id = id.id; // assuming each element is { id: "O-..." }

      // pass bounds in case you want them later on the instance
      myVehicle.latMax = this.latMax;
      myVehicle.latMin = this.latMin;
      myVehicle.longMax = this.longMax;
      myVehicle.longMin = this.longMin;

      this.getVehicleDataFromVehicleId(myVehicle.id)
        .then((vehicleResp) => {
          console.log("[VehicleFleet] vehicleResp:", vehicleResp);

          const vehicleData = vehicleResp.data?.[0];
          if (!vehicleData) {
            console.warn("[VehicleFleet] no data for vehicle", myVehicle.id);
            return;
          }

          myVehicle.setVehicleData(vehicleData);
          this.fleet.push(myVehicle);
          console.log(
            "[VehicleFleet] pushed vehicle to fleet. fleet size:",
            this.fleet.length
          );
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
