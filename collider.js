class Collider {
  constructor(inputHandler, world) {
    this.input = inputHandler; // for zoomNum + offset
    this.world = world; // for all coord conversions
  }

  handleCollisions(mousePressed, loaded_stops) {
    if (mousePressed) {
      return this.handleClickOnStop(loaded_stops);
    }
    return null;
  }

  handleClickOnStop(loaded_stops) {
    for (let stop of loaded_stops) {
      // stop.x, stop.y should be in WORLD space
      const p = this.world.worldToScreen(stop.x, stop.y, this.input);
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

  // ---- helper for rectangles ----
  _pointInRect(mx, my, rect) {
    return (
      mx >= rect.x &&
      mx <= rect.x + rect.w &&
      my >= rect.y &&
      my <= rect.y + rect.h
    );
  }

  handleClickOnClosePopupBox(popupbox) {
    if (!popupbox.visible) return null;

    const closeButton = popupbox._closeButtonRect();
    if (this._pointInRect(mouseX, mouseY, closeButton)) {
      return true;
    }
    return null;
  }

  handleClickOnTitlePopupBox(popupbox) {
    if (!popupbox.visible) return null;

    const titleBar = popupbox._titleBarRect();
    if (this._pointInRect(mouseX, mouseY, titleBar)) {
      return true;
    }
    return null;
  }

  // handleVehicleCarriageOnPolyline(vehicle, shape) {

  //   // get vehicle id, match with shape json,
  //   // load out polyline data (or fetch this data cus it's already done)
  //   // get algo to detech the 2 collisions (might be more edge cases)
  //   // based on vehicle direction, pick the proper one
  //   // spawn a new vehicle slightly behind on collision
  //   // need to do math and spawn the vehicle data of:
  //   //x, y, w, h, center point, point of intersection, maybe trig idk
  //   // allign vehicle so it's a line from one carriage to the next
  //   // return {x, y}
  // }
}
