class InputHandler {
  constructor() {
    this.keys = {};
    this.zoomNum = 1;
    this.dragStart = null;
    this.offset = createVector(0, 0);
    this.popupDrag = false;

    this.MIN_ZOOM = 0.2;
    this.MAX_ZOOM = 100;
    this.KEY_ZOOM_FACTOR = 1.02;
    this.WHEEL_BASE = 1.0015;
  }

  worldToScreenPoint(wx, wy) {
    return {
      x: wx * this.zoomNum + this.offset.x,
      y: wy * this.zoomNum + this.offset.y,
    };
  }
  screenToWorld(sx, sy) {
    return createVector(
      (sx - this.offset.x) / this.zoomNum,
      (sy - this.offset.y) / this.zoomNum
    );
  }
  worldToScreen(wx, wy) {
    return createVector(
      wx * this.zoomNum + this.offset.x,
      wy * this.zoomNum + this.offset.y
    );
  }

  zoomAt(factor, sx = mouseX, sy = mouseY) {
    const prevZoom = this.zoomNum;
    const nextZoom = constrain(prevZoom * factor, this.MIN_ZOOM, this.MAX_ZOOM);
    if (nextZoom === prevZoom) return;

    const w = this.screenToWorld(sx, sy);
    this.offset.x = sx - w.x * nextZoom;
    this.offset.y = sy - w.y * nextZoom;

    this.zoomNum = nextZoom;
  }

  handleKeyPressed(k) {
    this.keys[k] = true;
  }
  handleKeyReleased(k) {
    this.keys[k] = false;
  }

  applyKeyZoomAtMouse() {
    if (this.keys["e"] || this.keys["="] || this.keys["+"]) {
      this.zoomAt(this.KEY_ZOOM_FACTOR, mouseX, mouseY);
    }
    if (this.keys["q"] || this.keys["-"] || this.keys["_"]) {
      this.zoomAt(1 / this.KEY_ZOOM_FACTOR, mouseX, mouseY);
    }
  }

  mouseClicked() {
    return true;
  }
  mousePressed() {
    this.dragStart = createVector(mouseX, mouseY);
  }
  mouseDragged() {
    if (!this.dragStart) return;
    const current = createVector(mouseX, mouseY);
    const delta = p5.Vector.sub(current, this.dragStart);
    this.dragStart = current;

    if (!this.popupDrag) {
      this.offset.add(delta);
    }

    return delta;
  }
  mouseReleased() {
    this.dragStart = null;
  }

  mouseWheel(event) {
    // event.delta > 0 is wheel down (zoom out)
    const factor = pow(this.WHEEL_BASE, event.delta);
    this.zoomAt(factor, mouseX, mouseY);
    return false;
  }

  applyTransform() {
    translate(this.offset.x, this.offset.y);
    scale(this.zoomNum);
  }
}
