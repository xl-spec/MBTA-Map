class UserInterface {
  constructor(input, world) {
    this.fps = new FPS(20, 30);
    this.saveState = new SaveState(700, 20, input);
    this.scaleBar = new ScaleBar(650, 700, input, world, 100);
    this.centerPoint = new CenterPoint(input, world, 4);
  }

  draw() {
    this.fps.draw();
    this.saveState.draw();
    this.scaleBar.draw();
    this.centerPoint.draw();
  }
}

class FPS {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.myFrameRate = 0;
    this.counter = 0;
  }

  updateFrameRateSlow() {
    if (this.counter % 15 == 0) {
      this.myFrameRate = frameRate();
    }
    this.counter += 1;
    return this.myFrameRate;
  }
  draw() {
    text(this.updateFrameRateSlow(), this.x, this.y);
  }
}

class SaveState {
  constructor(x, y, input) {
    this.x = x;
    this.y = y;
    this.input = input;
    this.button = createButton("save");
    this.button.position(this.x, this.y);

    this.button.mousePressed(() => {
      console.log("Save button clicked");
      this.input.saveSettings();
    });
  }

  draw() {}
}

class ScaleBar {
  constructor(x, y, input, world, width) {
    this.x = x;
    this.y = y;
    this.input = input;
    this.world = world;
    this.width = width;
    this.referenceNumber = 0;
  }

  update() {
    this.referenceNumber = this.world.screenDistanceMiles(
      this.x,
      this.y,
      this.x + this.width,
      this.y,
      this.input
    );
  }

  draw() {
    this.update();
    rect(this.x, this.y, this.width, 1);
    textAlign(CENTER);
    text(
      this.referenceNumber.toFixed(10) + " miles",
      this.x + this.width / 2,
      this.y - 5
    );
  }
}

class CenterPoint {
  constructor(input, world, size) {
    this.input = input;
    this.world = world;
    this.size = size;

    this.longAndLat = "";
  }

  getLongAndLat() {
    // center of the canvas
    const cx = width / 2;
    const cy = height / 2;

    const info = this.world.screenToLatLon(cx, cy, this.input);
    this.longAndLat = `${info.lat.toFixed(6)}, ${info.lon.toFixed(6)}`;
    return this.longAndLat;
  }

  draw() {
    const cx = width / 2;
    const cy = height / 2;

    circle(cx, cy, this.size);
    textAlign(CENTER);
    text(this.getLongAndLat(), cx, cy);
  }
}
