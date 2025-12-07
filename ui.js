class UserInterface {
  constructor(input) {
    this.fps = new FPS(20, 30);
    this.saveState = new SaveState(700, 20, input);
    this.scaleBar = new ScaleBar(650, 700, input, 100);
  }

  draw() {
    this.fps.draw();
    this.saveState.draw();
    this.scaleBar.draw();
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
    if (this.counter % 20 == 0) {
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
  constructor(x, y, input, width) {
    this.x = x;
    this.y = y;
    this.input = input;
    this.width = width;

    this.referenceNumber = 0;
  }

  // calculateScaleBar(x, y) {
  //   // this.referenceNumber =
  //   let x = 50 + ((lon - minLon) * (width - 100)) / (maxLon - minLon);
  //   let y = 50 + ((maxLat - lat) * (height - 100)) / (maxLat - minLat);
  // }

  draw() {
    rect(this.x, this.y, this.width, 1);
    //adjust text later, close enough right now
    text(this.referenceNumber, this.x + this.width / 2, this.y);
  }
}

// class
