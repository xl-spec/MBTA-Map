class PopUpBox {
  constructor(input) {
    this.input = input;
    this.x = 500;
    this.y = 20;
    this.w = 250;
    this.h = 400;

    this.titleBarH = 30;
    this.cornerR = 5;
    this.visible = false;
    this.dragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // close button layout (relative to window)
    this.closeSize = 18;
    this.closeMargin = 6;

    this.title = "Info";
    this.textLines = []; // you can fill this with strings
    this.statusWritten = false;
  }

  resetStatus() {
    this.textLines = [];
    this.statusWritten = false;
  }

  setStatus(stopData) {
    if (!this.statusWritten) {
      let attr = stopData.getAllStopAttributes();
      // console.log(attr);
      this.textLines.push(attr.name);
      this.textLines.push(attr.description);
      this.textLines.push(attr.id);
      this.statusWritten = true;
      console.log(this.textLines);
    }
  }

  draw() {
    if (!this.visible) return;

    push();

    // window background
    noStroke();
    fill(240);
    rect(this.x, this.y, this.w, this.h, this.cornerR);
    color(255, 128, 128).setAlpha(128);
    // title bar
    fill(200);
    rect(
      this.x,
      this.y,
      this.w,
      this.titleBarH,
      this.cornerR,
      this.cornerR,
      0,
      0
    );

    // title text
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(14);
    text(this.title, this.x + 10, this.y + this.titleBarH / 2);

    // close button (little X)
    const cb = this._closeButtonRect();
    fill(220);
    rect(cb.x, cb.y, cb.w, cb.h, 4);
    fill(80);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("✕", cb.x + cb.w / 2, cb.y + cb.h / 2);

    // content area
    const padding = 8;
    let ty = this.y + this.titleBarH + padding;
    textAlign(LEFT, TOP);
    textSize(12);
    fill(20);
    for (let line of this.textLines) {
      text(
        line,
        this.x + padding,
        ty,
        this.w - padding * 2,
        this.h - this.titleBarH - padding * 2
      );
      ty += 16;
    }

    pop();
  }

  _titleBarRect() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.titleBarH,
    };
  }

  _closeButtonRect() {
    return {
      x: this.x + this.w - this.closeSize - this.closeMargin,
      y: this.y + (this.titleBarH - this.closeSize) / 2,
      w: this.closeSize,
      h: this.closeSize,
    };
  }
}
