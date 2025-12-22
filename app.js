class App {
  constructor() {
    this.mymap = new Map();
    this.loader = new Loader();
    this.world = new World();
    this.inputHandler = new InputHandler(this.world);
    this.mbtaclient = new MBTAClient();
    this.collider = new Collider(this.inputHandler, this.world);
    this.vehicleFleet = new VehicleFleet(
      this.mbtaclient,
      this.world,
      this.inputHandler,
      this.loader,
      this.collider
    );
    this.popupbox = new PopUpBox(this.mbtaclient);
    this.ui = new UserInterface(this.inputHandler, this.world);

    this.ready = false;
  }

  // --- async setup, but preserves your setup logic ---
  async setup() {
    // Your old preload() content:
    await this.loader.preloadData();

    // Your old setup() content:
    this.loader.loadStops(this.loader.stopsData);
    this.loader.loadRoutes(this.loader.routesData);

    // KEEP async calls, but do not change your usage
    // If you implement loader.loadShapesAsync(), we await it.
    // If you haven't implemented it yet, we fallback to loader.loadShapes() and continue (same as before).
    if (typeof this.loader.loadShapesAsync === "function") {
      await this.loader.loadShapesAsync();
    } else {
      this.loader.loadShapes();
    }

    this.world.getLocalMinMax(this.loader);
    this.world.setScreenBounds(50, 50, width - 100, height - 100);

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
      // your original call
      // NOTE: if setAllVehicleData is async already, awaiting it is safe
      const maybePromise = this.vehicleFleet.setAllVehicleData();
      if (maybePromise && typeof maybePromise.then === "function")
        await maybePromise;
    }

    this.ready = true;
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

    // KEEP: vehicleFleet.setAllVehicleData(); is commented out in your original
    this.inputHandler.applyKeyZoomAtMouse();
    this.inputHandler.applyTransform();

    for (const route of this.loader.list_of_routes) {
      if (!route.shape || route.shape.length === 0) continue;

      stroke(`#${route.color || "999999"}`);
      if (
        route.color != "FFC72C" && // temp, no buses, ferries, and commuter
        route.color != "008EAA" &&
        route.color != "80276C"
      ) {
        noFill();
        strokeWeight(2 / this.inputHandler.zoomNum);

        for (let coords of route.shape) {
          beginShape();
          for (const [lat, lon] of coords) {
            let x = map(
              lon,
              this.loader.longMin,
              this.loader.longMax,
              50,
              width - 50
            );
            let y = map(
              lat,
              this.loader.latMax,
              this.loader.latMin,
              50,
              height - 50
            );
            vertex(x, y);
          }
          endShape();
        }
      }
    }

    fill(0);
    noStroke();

    // load stops (circles) (unchanged)
    for (let stop of this.loader.list_of_stops) {
      if (stop.vehicle_type == 0 || stop.vehicle_type == 1) {
        stop.x = map(
          stop.longitude,
          this.loader.longMin,
          this.loader.longMax,
          50,
          width - 50
        );
        stop.y = map(
          stop.latitude,
          this.loader.latMax,
          this.loader.latMin,
          50,
          height - 50
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
