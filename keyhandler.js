class KeyHandler {
  constructor() {
    this.keys = {};
    this.zoomNum = 1;
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
}
