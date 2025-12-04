class UserInterface {
  constructor(input) {
    this.fps = new FPS(20, 30);
    this.saveState = new SaveState(700, 20, input);
  }

  draw() {
    this.fps.draw();
    this.saveState.draw();
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

  draw() {
    // positioning is handled in the constructor; nothing needed per-frame
  }
}

// class
