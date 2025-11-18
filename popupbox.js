class PopUpBox {
  constructor(input) {
    this.input = input;
    this.show = false;

    this.wx = 0;
    this.wy = 0;
  }

  draw() {
    if (!this.show) return;

    const p = this.input.worldToScreenPoint(this.wx, this.wy);
    const sx = p.x;
    const sy = p.y;
    const w = 120;
    const h = 70;
    rect(sx + 10, sy - h - 10, w, h, 5);
  }
}
