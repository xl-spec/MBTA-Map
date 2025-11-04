function preload() {
  mymap = new Map();
  loader = new Loader();
  ui = new UserInterface();
  loader.preloadData();
}

function setup() {
  createCanvas(800, 800);

  inputHandler = new InputHandler();
  loader.loadStops(loader.stopsData);
  loader.loadRoutes(loader.routesData);
  loader.loadShapes();
}

function draw() {
  background(220);
  push();

  inputHandler.applyTransform();
  inputHandler.applyKeyZoomAtMouse();
  ui.draw();
  // scale(inputHandler.zoomNum);

  for (const route of loader.list_of_routes) {
    if (!route.shape || route.shape.length === 0) continue;
    stroke(`#${route.hexcolor || "999999"}`);
    if (
      route.hexcolor != "FFC72C" &&
      route.hexcolor != "008EAA" &&
      route.hexcolor != "80276C"
    ) {
      mymap.set(route.id, route.hexcolor);
      noFill();

      for (const coords of route.shape) {
        beginShape();
        for (const [lat, lon] of coords) {
          let x = map(lon, loader.longMin, loader.longMax, 50, width - 50);
          let y = map(lat, loader.latMax, loader.latMin, 50, height - 50);
          vertex(x, y);
        }
        endShape();
      }
      console.log(mymap);
    }
  }

  fill(0);
  noStroke();

  for (const stop of loader.list_of_stops) {
    const x = map(
      stop.longitude,
      loader.longMin,
      loader.longMax,
      50,
      width - 50
    );
    const y = map(stop.latitude, loader.latMax, loader.latMin, 50, height - 50);
    circle(x, y, 1);
  }
  pop();
  // handleZoom();
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

function mousePressed() {
  inputHandler.mousePressed();
}

function mouseDragged() {
  inputHandler.mouseDragged();
}

function mouseReleased() {
  inputHandler.mouseReleased();
}

function mouseWheel(event) {
  inputHandler.mouseWheel(event);
  return false;
}
