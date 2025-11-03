class InputHandler {
  constructor() {
    this.keys = {};
    this.zoomNum = 1;
    this.dragStart = null;
    this.ZOOM_STEP = 0.01;
    // this.offset = createVector(0, 0);
  }

  handleKeyPressed(k) {
    this.keys[k] = true;
  }

  handleKeyReleased(k) {
    this.keys[k] = false;
  }

  getZoom() {
    let zoomDelta = 0;
    if (this.keys["e"] || this.keys["+"]) {
      zoomDelta += ZOOM_STEP;
    }
    if (this.keys["q"] || this.keys["_"]) {
      zoomDelta -= ZOOM_STEP;
    }
    return zoomDelta;
  }

  setZoom(zoomDelta) {
    this.zoomNum += zoomDelta;
  }

  mousePressed() {
    this.dragStart = createVector(mouseX, mouseY);
  }

  mouseDragged() {
    if (this.dragStart) {
      let current = createVector(mouseX, mouseY);
      let delta = Vector.sub(current, this.dragStart);
      this.offset.add(delta);
      this.dragStart = current;
    }
  }

  mouseReleased() {
    this.dragStart = null;
  }

  mouseWheel(event) {
    const k = 0.0015;
    zoomNum -= event.delta * k;
    // zoomNum = constrain(zoomNum, MIN_ZOOM, MAX_ZOOM);
    return false;
  }

  //   applyTranslation() {
  //     // Apply panning offset
  //     translate(this.offset.x, this.offset.y);
  //   }
}
