class Collider {
  constructor(inputHandler) {
    this.input = inputHandler; // object from sketch
  }

  handleCollisions(mousePressed, loaded_stops) {
    if (mousePressed) {
      this.handleClickOnStop(loaded_stops);
    }
  }

  handleClickOnStop(loaded_stops) {
    for (const stop of loaded_stops) {
      const p = this.input.worldToScreenPoint(stop.x, stop.y);
      const sx = p.x;
      const sy = p.y;
      const dx = mouseX - sx;
      const dy = mouseY - sy;

      const r = stop.circleSize * 0.5 * this.input.zoomNum;

      if (dx * dx + dy * dy <= r * r) {
        return stop;
      }
    }
    return null;
  }
}
