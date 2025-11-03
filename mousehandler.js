class MouseHandler {
  constructor() {
    this.dragStart = null;
    this.offset = createVector(0, 0);
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
    ZOOMIES -= event.delta * k;
    ZOOMIES = constrain(ZOOMIES, MIN_ZOOM, MAX_ZOOM);
    // Prevent the page from scrolling
    return false;
  }

  applyTranslation() {
    // Apply panning offset
    translate(this.offset.x, this.offset.y);
  }
}
