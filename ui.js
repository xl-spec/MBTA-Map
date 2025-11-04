class UserInterface {
  constructor() {
    this.myFrameRate = 0;
    this.counter = 0;
  }

  updateFrameRate() {
    if (this.counter % 20 == 0) {
      this.myFrameRate = frameRate();
    }
    this.counter += 1;
  }

  draw() {
    this.updateFrameRate();
    text(this.myFrameRate, 50, 50);
  }
}
