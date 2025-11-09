class Collider {
  constructor(x, y, r, colorDefault, colorActive) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.colorDefault = colorDefault;
    this.colorActive = colorActive;
    this.isActive = false;
  }

  handleCollisions(mousePressed, loaded_stops) {
    this.handleClickOnCircle(mousePressed, loaded_stops);
  }

  handleClickOnCircle(mousePressed, loaded_stops) {
    // expensive call becuz of loop, redo if slow
    if (mousePressed) {
      ////////////////CANT DO THIS, BECUZ THE SCREEN GETS TRANSLATED. REDOOOO
      console.log("clicked");
      for (let stop of loaded_stops) {
        let d = dist(mouseX, mouseY, stop.x, stop.y);
        if (d < stop.circleSize / 2) {
          console.log("collided click");
          return true;
        }
      }
    }
    return false;
  }
}
