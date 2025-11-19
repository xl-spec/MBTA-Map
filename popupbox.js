class PopUpBox {
  constructor(input) {
    this.input = input;
    this.show = false;
    this.x = 500;
    this.y = 20;
    this.w = 250;
    this.h = 400;
    this.cornerR = 5;
  }

  draw() {
    if (!this.show) return;

    this.input.zoomNum;

    rect(
      (this.x - this.input.offset.x) / this.input.zoomNum,
      (this.y - this.input.offset.y) / this.input.zoomNum,
      this.w * (1 / this.input.zoomNum),
      this.h * (1 / this.input.zoomNum),
      this.cornerR / this.input.zoomNum
    );
  }
}
