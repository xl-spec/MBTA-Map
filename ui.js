class UserInterface {
  constructor(input) {
    this.originalXY = 0;
    this.myFrameRate = 0;
    this.counter = 0;
    this.input = input;
    this.x = 50;
    this.y = 50;
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
    // text(frameRate(), this.x, this.y);
  }
}
