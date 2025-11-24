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
    for (let stop of loaded_stops) {
      let p = this.input.worldToScreenPoint(stop.x, stop.y);
      let sx = p.x;
      let sy = p.y;
      let dx = mouseX - sx;
      let dy = mouseY - sy;

      let r = stop.circleSize * 0.5 * this.input.zoomNum;

      if (dx * dx + dy * dy <= r * r) {
        return stop;
      }
    }
    return null;
  }

  handleClickOnClosePopupBox(popupbox) {
    if (!popupbox.visible) return;

    const closeButton = popupbox._closeButtonRect();
    const mx = mouseX;
    const my = mouseY;

    if (
      mx >= closeButton.x &&
      mx <= closeButton.x + closeButton.w &&
      my >= closeButton.y &&
      my <= closeButton.y + closeButton.h
    ) {
      return true;
    }
    return null;
  }

  handleClickOnTitlePopupBox(popupbox) {
    if (!popupbox.visible) return;

    const titleBar = popupbox._titleBarRect();
    const mx = mouseX;
    const my = mouseY;

    if (
      mx >= titleBar.x &&
      mx <= titleBar.x + titleBar.w &&
      my >= titleBar.y &&
      my <= titleBar.y + titleBar.h
    ) {
      return true;
    }
    return null;
  }
}
