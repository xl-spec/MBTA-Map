function preload() {
  loader = new Loader();
  loader.preloadData();
}

function setup() {
  createCanvas(800, 800);

  mouseHandler = new MouseHandler();
  keyHandler = new KeyHandler();
  loader.loadStops(loader.stopsData);
  loader.loadRoutes(loader.routesData);
  loader.loadShapes();
}

function draw() {
  background(220);
  mouseHandler.applyTranslation();

  for (const route of loader.list_of_routes) {
    if (!route.shape || route.shape.length === 0) continue;
    stroke(`#${route.hexcolor || "999999"}`);
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
    circle(x, y, 0.2);
  }

  handleZoom();
}

function handleZoom() {
  keyHandler.setZoom(keyHandler.getZoom());
}
