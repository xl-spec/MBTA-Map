let app;

async function setup() {
  createCanvas(800, 800);
  app = new App();
  // app = new AppTester();
  await app.setup(); // async init (shapes + vehicles can be awaited)
}

function draw() {
  app.draw();
}

// --- KEEP YOUR IO EXACTLY ---
function handleZoom() {
  app.handleZoom();
}

function keyPressed() {
  app.keyPressed(key);
}
function keyReleased() {
  app.keyReleased(key);
}

function mouseClicked() {
  app.mouseClicked();
}
function mousePressed() {
  app.mousePressed();
}
function mouseDragged() {
  app.mouseDragged();
}
function mouseReleased() {
  app.mouseReleased();
}

function mouseWheel(event) {
  app.mouseWheel(event);
  return false;
}
