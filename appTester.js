class AppTester {
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
      this.collider
    );
    this.popupbox = new PopUpBox(this.mbtaclient);
    this.ui = new UserInterface(this.inputHandler, this.world);

    this.ready = false;

    // ---- SHAPE INSPECTION STATE ----
    this.routeIndex = 0; // index in loader.list_of_routes
    this.shapeIndex = 0; // index in route.shapes
    this.pointIndex = 0; // points revealed within current shape

    this.revealSpeed = 2; // points per frame
    this.autoAdvance = true; // space toggles
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

    if (typeof this.vehicleFleet.setAllVehicleDataAsync === "function") {
      await this.vehicleFleet.setAllVehicleDataAsync();
    } else {
      const maybePromise = this.vehicleFleet.setAllVehicleData();
      if (maybePromise?.then) await maybePromise;
    }

    // Reset inspector cursors
    this.routeIndex = 0;
    this.shapeIndex = 0;
    this.pointIndex = 0;

    this.ready = true;
  }

  draw() {
    background(220);

    if (!this.ready) {
      this._drawLoading();
      return;
    }

    // ---- WORLD DRAW ----
    push();
    this.inputHandler.applyKeyZoomAtMouse();
    this.inputHandler.applyTransform();

    // Grab the current route
    const routes = this.loader.list_of_routes || [];
    const route = routes[this.routeIndex];

    // Safely find the next route that actually has shapes
    // (so ArrowUp doesn't land you on empty routes forever)
    const safeRoute = this._getNearestRouteWithShapes(this.routeIndex);
    const activeRoute = safeRoute.route;
    this.routeIndex = safeRoute.index;

    if (activeRoute && activeRoute.shapes && activeRoute.shapes.length > 0) {
      // Clamp shapeIndex
      if (this.shapeIndex >= activeRoute.shapes.length) {
        this.shapeIndex = 0;
        this.pointIndex = 0;
      }

      const shapeObj = activeRoute.shapes[this.shapeIndex];
      const coords = shapeObj?.shape; // expecting [[lat, lon], ...]

      if (coords && coords.length > 0) {
        // color per shape (helps spot overlap/duplicates)
        const hue = (this.shapeIndex * 47) % 360;
        stroke(`hsl(${hue}, 80%, 45%)`);
        strokeWeight(
          (0.8 * (shapeObj.drawSize ?? 1)) / this.inputHandler.zoomNum
        );
        noFill();

        // draw polyline progressively (pointIndex)
        beginShape();
        for (let i = 0; i < Math.min(this.pointIndex, coords.length); i++) {
          const [lat, lon] = coords[i];
          const x = map(
            lon,
            this.loader.longMin,
            this.loader.longMax,
            50,
            width - 50
          );
          const y = map(
            lat,
            this.loader.latMax,
            this.loader.latMin,
            50,
            height - 50
          );
          vertex(x, y);
        }
        endShape();

        // point markers (optional but useful)
        stroke(0, 60);
        for (let i = 0; i < Math.min(this.pointIndex, coords.length); i++) {
          const [lat, lon] = coords[i];
          const x = map(
            lon,
            this.loader.longMin,
            this.loader.longMax,
            50,
            width - 50
          );
          const y = map(
            lat,
            this.loader.latMax,
            this.loader.latMin,
            50,
            height - 50
          );
          circle(x, y, 2);
        }

        // auto-advance
        if (this.autoAdvance) {
          this.pointIndex += this.revealSpeed;
          if (this.pointIndex >= coords.length) {
            this.pointIndex = 0;
            this.shapeIndex++;

            if (this.shapeIndex >= activeRoute.shapes.length) {
              this.shapeIndex = 0;
            }
          }
        }
      }
    }

    // ---- STOPS (unchanged) ----
    fill(0);
    noStroke();
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

    // ---- UI + DEBUG HUD ----
    push();

    fill(0);
    noStroke();
    textSize(12);

    const r = this.loader.list_of_routes?.[this.routeIndex];
    const shapeObj = r?.shapes?.[this.shapeIndex];
    const coordsLen = shapeObj?.shape?.length ?? 0;

    text(
      `route: ${r?.id ?? "—"}\n` +
        `shape: ${this.shapeIndex + 1}/${r?.shapes?.length ?? 0}\n` +
        `shapeID: ${shapeObj?.shapeID ?? "—"}\n` +
        `points: ${coordsLen}\n` +
        `auto: ${this.autoAdvance ? "ON" : "OFF"} (space)\n` +
        `speed: ${this.revealSpeed} ([-]/[+])`,
      20,
      20
    );

    this.popupbox.draw();
    this.ui.draw();
    pop();
  }

  _getNearestRouteWithShapes(startIndex) {
    const routes = this.loader.list_of_routes || [];
    if (routes.length === 0) return { route: null, index: 0 };

    // Try current first
    const r0 = routes[startIndex];
    if (r0?.shapes?.length > 0) return { route: r0, index: startIndex };

    // Otherwise search forward
    for (let step = 1; step < routes.length; step++) {
      const idx = (startIndex + step) % routes.length;
      const r = routes[idx];
      if (r?.shapes?.length > 0) return { route: r, index: idx };
    }
    // none have shapes
    return { route: routes[startIndex] ?? null, index: startIndex };
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

  // ---- INPUT PASSTHROUGH + INSPECTOR CONTROLS ----
  handleZoom() {
    this.inputHandler.setZoom(this.inputHandler.getZoom());
  }

  keyPressed(k) {
    this.inputHandler.handleKeyPressed(k);

    // ---- inspector controls ----
    if (k === " ") {
      this.autoAdvance = !this.autoAdvance;
    }

    // next shape
    if (k === "ArrowRight") {
      this.shapeIndex++;
      this.pointIndex = 0;
    }

    // prev shape
    if (k === "ArrowLeft") {
      this.shapeIndex = max(0, this.shapeIndex - 1);
      this.pointIndex = 0;
    }

    // next route (skip empties automatically via _getNearestRouteWithShapes)
    if (k === "ArrowUp") {
      const routes = this.loader.list_of_routes || [];
      if (routes.length > 0) {
        this.routeIndex = (this.routeIndex + 1) % routes.length;
        this.shapeIndex = 0;
        this.pointIndex = 0;
      }
    }

    // prev route
    if (k === "ArrowDown") {
      const routes = this.loader.list_of_routes || [];
      if (routes.length > 0) {
        this.routeIndex = (this.routeIndex - 1 + routes.length) % routes.length;
        this.shapeIndex = 0;
        this.pointIndex = 0;
      }
    }

    // speed controls
    if (k === "+" || k === "=")
      this.revealSpeed = min(50, this.revealSpeed + 1);
    if (k === "-" || k === "_") this.revealSpeed = max(1, this.revealSpeed - 1);
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
      this.popupbox.visible = true;
      this.popupbox.resetStatus();
      this.popupbox.setStatus(hitStop, this.vehicleFleet);
    }
    if (this.collider.handleClickOnClosePopupBox(this.popupbox)) {
      this.popupbox.visible = false;
    }
    if (this.collider.handleClickOnTitlePopupBox(this.popupbox)) {
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
    this.inputHandler.popupDrag = false;
  }

  mouseWheel(event) {
    this.inputHandler.mouseWheel(event);
  }
}
