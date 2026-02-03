class App {
  constructor() {
    this.mymap = new Map();
    this.world = new World();
    this.loader = new Loader();
    this.inputHandler = new InputHandler(this.world);
    this.mbtaclient = new MBTAClient();
    this.collider = new Collider(this.inputHandler, this.world);
    this.vehicleFleet = new VehicleFleet(
      this.mbtaclient,
      this.world,
      this.inputHandler,
      this.loader,
      this.collider,
    );
    this.popupbox = new PopUpBox(this.mbtaclient);
    this.ui = new UserInterface(this.inputHandler, this.world);

    this.ready = false;

    this.count = 1;
    this.count2 = 0;
  }

  async setup() {
    await this.loader.preloadData();

    this.loader.loadStops(this.loader.stopsData);
    this.loader.loadRoutes(this.loader.routesData);

    await this.loader.loadShapesAsync();
    await this.loader.densifyAllRoutesAsync(10, this.world);

    this.world.getLocalMinMax(this.loader);
    this.world.setScreenBounds(50, 50, width - 100, height - 100);
    this.loader.computeWorldGeometry(this.world);

    // temp fix
    this.vehicleFleet.latMax = this.loader.latMax;
    this.vehicleFleet.latMin = this.loader.latMin;
    this.vehicleFleet.longMax = this.loader.longMax;
    this.vehicleFleet.longMin = this.loader.longMin;

    /////////////
    /////temp, for button later

    if (typeof this.vehicleFleet.setAllVehicleDataAsync === "function") {
      await this.vehicleFleet.setAllVehicleDataAsync();
    } else {
      const maybePromise = this.vehicleFleet.setAllVehicleData();
      if (maybePromise && typeof maybePromise.then === "function")
        await maybePromise;
    }

    this.ready = true;

    // for (const route of this.loader.list_of_routes) {
    //   console.log("?");
    // }

    for (const route of this.loader.list_of_routes) {
      //   if (!route.shape || route.shape.length === 0) continue;
      stroke(`#${route.color || "999999"}`);
      if (
        route.color != "FFC72C" && // temp, no buses, ferries, and commuter
        route.color != "008EAA" &&
        route.color != "80276C"
      ) {
        console.log(route.id);
      }
    }
    for (const route of this.loader.list_of_routes) {
      if (!route.coordinates || route.coordinates.length === 0) continue;
      stroke(`#${route.color || "999999"}`);
      if (route.id == "Green-E") {
        // console.log(route.shape);
        for (const shapeObj of route.shapes) {
          const coords = shapeObj.coordinates;
          //   console.log(coords[0]);
        }
      }
    }
    //   let routeLen = this.loader.list_of_routes.length;
  }

  draw() {
    background(220);

    if (!this.ready) {
      this._drawLoading();
      return;
    }

    push();
    fill(0);
    noStroke();

    this.inputHandler.applyKeyZoomAtMouse();
    this.inputHandler.applyTransform();

    for (const route of this.loader.list_of_routes) {
      stroke(`#${route.color || "999999"}`);
      if (
        route.color != "FFC72C" && // temp, no buses, ferries, and commuter
        route.color != "008EAA" &&
        route.color != "80276C"
      ) {
        // if (route.id == "Mattapan") {
        noFill();
        strokeWeight(0.5 / this.inputHandler.zoomNum);
        for (const shapeObj of route.customShape) {
          // for (const shapeObj of route.shapes) {
          const coords = shapeObj.coordinates;
          beginShape();
          for (const [lat, lon] of coords) {
            let x = map(
              lon,
              this.loader.longMin,
              this.loader.longMax,
              50,
              width - 50,
            );
            let y = map(
              lat,
              this.loader.latMax,
              this.loader.latMin,
              50,
              height - 50,
            );
            vertex(x, y);
            circle(x, y, 0.1);
          }
          endShape();
        }
      }
    }

    fill(0);
    noStroke();

    // stops
    for (let stop of this.loader.list_of_stops) {
      if (stop.vehicle_type == 0 || stop.vehicle_type == 1) {
        stop.x = map(
          stop.longitude,
          this.loader.longMin,
          this.loader.longMax,
          50,
          width - 50,
        );
        stop.y = map(
          stop.latitude,
          this.loader.latMax,
          this.loader.latMin,
          50,
          height - 50,
        );

        circle(stop.x, stop.y, stop.circleSize);
      }
    }

    this.vehicleFleet.draw();
    pop();

    push();
    this.popupbox.draw();
    this.ui.draw();
    pop();
  }

  _drawLoading() {
    push();
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Loading…", width / 2, height / 2);
    pop();
  }

  // --- keep your IO functions EXACTLY ---
  handleZoom() {
    this.inputHandler.setZoom(this.inputHandler.getZoom());
  }

  keyPressed(k) {
    this.inputHandler.handleKeyPressed(k);
  }

  keyReleased(k) {
    this.inputHandler.handleKeyReleased(k);
  }

  mouseClicked() {
    this.inputHandler.mouseClicked();
  }

  mousePressed() {
    this.inputHandler.mousePressed();

    const hitStop = this.collider.handleClickOnStop(this.loader.list_of_stops);
    if (hitStop) {
      console.log("click on stop");
      this.popupbox.visible = true;
      this.popupbox.resetStatus();
      this.popupbox.setStatus(hitStop, this.vehicleFleet);
    }
    if (this.collider.handleClickOnClosePopupBox(this.popupbox)) {
      this.popupbox.visible = false;
    }
    if (this.collider.handleClickOnTitlePopupBox(this.popupbox)) {
      console.log("popupdrag = true");
      this.inputHandler.popupDrag = true;
    }
  }

  mouseDragged() {
    let delta = this.inputHandler.mouseDragged();

    if (delta) {
      this.popupbox.x += delta.x;
      this.popupbox.y += delta.y;
    }
  }

  mouseReleased() {
    this.inputHandler.mouseReleased();

    if (this.inputHandler.popupDrag) {
      console.log("popupdrag = false");
      this.inputHandler.popupDrag = false;
    }
  }

  mouseWheel(event) {
    this.inputHandler.mouseWheel(event);
  }
}
