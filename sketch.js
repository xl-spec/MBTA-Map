function preload() {
  mymap = new Map();
  loader = new Loader();
  loader.preloadData();

  inputHandler = new InputHandler();
  world = new World();
  mbtaclient = new MBTAClient();
  vehicleFleet = new VehicleFleet(mbtaclient, world, inputHandler);
  collider = new Collider(inputHandler, world);
  popupbox = new PopUpBox(mbtaclient);
  ui = new UserInterface(inputHandler, world);
}

function setup() {
  createCanvas(800, 800);
  // createCanvas(2000, 1200);

  loader.loadStops(loader.stopsData);
  loader.loadRoutes(loader.routesData);
  loader.loadShapes();
  world.getLocalMinMax(loader);
  world.setScreenBounds(50, 50, width - 100, height - 100);

  // settings for now
  // popupbox.visible = true;

  // temp fix
  vehicleFleet.latMax = loader.latMax;
  vehicleFleet.latMin = loader.latMin;
  vehicleFleet.longMax = loader.longMax;
  vehicleFleet.longMin = loader.longMin;

  vehicleFleet.setAllVehicleData();
}

function draw() {
  background(220);
  push();
  fill(0);
  noStroke();
  // vehicleFleet.setAllVehicleData();
  inputHandler.applyKeyZoomAtMouse();
  inputHandler.applyTransform();

  // load polyline
  for (const route of loader.list_of_routes) {
    if (!route.shape || route.shape.length === 0) continue;
    stroke(`#${route.hexcolor || "999999"}`);
    if (
      route.hexcolor != "FFC72C" && // temp, no buses, ferries, and commuter
      route.hexcolor != "008EAA" &&
      route.hexcolor != "80276C"
    ) {
      // console.log(route.id);
      // mymap.set(route.id, route.hexcolor);
      noFill();
      strokeWeight(2 / inputHandler.zoomNum);
      for (let coords of route.shape) {
        beginShape();
        for (const [lat, lon] of coords) {
          let x = map(lon, loader.longMin, loader.longMax, 50, width - 50);
          let y = map(lat, loader.latMax, loader.latMin, 50, height - 50);
          vertex(x, y);
        }
        endShape();
      }
    }
  }

  fill(0);
  noStroke();

  //load stops (circles)
  for (let stop of loader.list_of_stops) {
    // console.log(stop.type);
    if (stop.vehicle_type == 0 || stop.vehicle_type == 1) {
      stop.x = map(
        stop.longitude,
        loader.longMin,
        loader.longMax,
        50,
        width - 50
      );
      stop.y = map(
        stop.latitude,
        loader.latMax,
        loader.latMin,
        50,
        height - 50
      );

      circle(stop.x, stop.y, stop.circleSize);
    }
  }
  vehicleFleet.draw();

  pop();

  push();
  popupbox.draw();
  ui.draw();

  pop();
}

function handleZoom() {
  inputHandler.setZoom(inputHandler.getZoom());
}

function keyPressed() {
  inputHandler.handleKeyPressed(key);
}

function keyReleased() {
  inputHandler.handleKeyReleased(key);
}

function mouseClicked() {
  inputHandler.mouseClicked();
}
function mousePressed() {
  inputHandler.mousePressed();

  const hitStop = collider.handleClickOnStop(loader.list_of_stops);
  if (hitStop) {
    console.log("click on stop");
    popupbox.visible = true;
    popupbox.resetStatus();
    popupbox.setStatus(hitStop, vehicleFleet);
  }
  if (collider.handleClickOnClosePopupBox(popupbox)) {
    popupbox.visible = false;
  }
  if (collider.handleClickOnTitlePopupBox(popupbox)) {
    console.log("popupdrag = true");
    inputHandler.popupDrag = true;
  }
}

function mouseDragged() {
  let delta = inputHandler.mouseDragged();

  if (delta) {
    popupbox.x += delta.x;
    popupbox.y += delta.y;
  }
}

function mouseReleased() {
  inputHandler.mouseReleased();

  if (inputHandler.popupDrag) {
    console.log("popupdrag = false");
    inputHandler.popupDrag = false;
  }
}

function mouseWheel(event) {
  inputHandler.mouseWheel(event);
  return false;
}
