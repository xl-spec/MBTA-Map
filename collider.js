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

  handleVehicleCarriageOnPolyline(leadVehicleX, leadVehicleY, shape) {
    // console.log(shape);
    //   // get vehicle id, match with shape json,
    //   // load out polyline data (or fetch this data cus it's already done)
    //   // get algo to detech the 2 collisions (might be more edge cases)
    //   // based on vehicle direction, pick the proper one
    //   // spawn a new vehicle slightly behind on collision
    //   // need to do math and spawn the vehicle data of:
    //   //x, y, w, h, center point, point of intersection, maybe trig idk
    //   // allign vehicle so it's a line from one carriage to the next
    //   // return {x, y}
  }

  // do ktree implementation later
  closestPointAndBehind(latLonPoints, qLon, qLat, world, distanceWorld = 90) {
    if (!latLonPoints || latLonPoints.length < 2) return null;

    const qWorld = world.latLonToWorld(qLat, qLon);

    let bestDist2 = Infinity;
    let bestSeg = -1;
    let bestT = 0;
    let bestClosest = null;

    // 1) Find closest point on polyline (segment projection)
    for (let i = 0; i < latLonPoints.length - 1; i++) {
      const [lat0, lon0] = latLonPoints[i];
      const [lat1, lon1] = latLonPoints[i + 1];

      const p0 = world.latLonToWorld(lat0, lon0);
      const p1 = world.latLonToWorld(lat1, lon1);

      const vx = p1.x - p0.x;
      const vy = p1.y - p0.y;
      const len2 = vx * vx + vy * vy;
      if (len2 === 0) continue;

      const wx = qWorld.x - p0.x;
      const wy = qWorld.y - p0.y;

      let t = (wx * vx + wy * vy) / len2;
      t = Math.max(0, Math.min(1, t));

      const cx = p0.x + t * vx;
      const cy = p0.y + t * vy;

      const dx = cx - qWorld.x;
      const dy = cy - qWorld.y;
      const d2 = dx * dx + dy * dy;

      if (d2 < bestDist2) {
        bestDist2 = d2;
        bestSeg = i;
        bestT = t;
        bestClosest = { x: cx, y: cy };
      }
    }

    if (bestSeg === -1 || !bestClosest) return null;

    // 2) Compute tangent/slope AT the closest point (endpoint-safe)
    // Choose a forward/back neighbor segment depending on t
    let aIdx, bIdx;
    if (bestT <= 0) {
      aIdx = bestSeg;
      bIdx = bestSeg + 1;
    } else if (bestT >= 1) {
      aIdx = bestSeg;
      bIdx = bestSeg + 1;
    } else {
      aIdx = bestSeg;
      bIdx = bestSeg + 1;
    }

    // If we’re at a hard endpoint, prefer the only valid direction
    if (bestSeg === 0 && bestT <= 0) {
      aIdx = 0;
      bIdx = 1;
    }
    if (bestSeg === latLonPoints.length - 2 && bestT >= 1) {
      aIdx = latLonPoints.length - 2;
      bIdx = latLonPoints.length - 1;
    }

    const [alat, alon] = latLonPoints[aIdx];
    const [blat, blon] = latLonPoints[bIdx];
    const A = world.latLonToWorld(alat, alon);
    const B = world.latLonToWorld(blat, blon);

    let tx = B.x - A.x;
    let ty = B.y - A.y;

    let tmag = Math.hypot(tx, ty);
    if (tmag === 0) {
      // fallback: search outward for a non-degenerate direction
      let found = false;
      for (let k = 1; k < latLonPoints.length; k++) {
        const i0 = Math.max(0, bestSeg - k);
        const i1 = Math.min(latLonPoints.length - 1, bestSeg + 1 + k);
        if (i1 === i0) continue;

        const [p0lat, p0lon] = latLonPoints[i0];
        const [p1lat, p1lon] = latLonPoints[i1];
        const P0 = world.latLonToWorld(p0lat, p0lon);
        const P1 = world.latLonToWorld(p1lat, p1lon);
        tx = P1.x - P0.x;
        ty = P1.y - P0.y;
        tmag = Math.hypot(tx, ty);
        if (tmag !== 0) {
          found = true;
          break;
        }
      }
      if (!found) return null;
    }

    const ux = tx / tmag;
    const uy = ty / tmag;

    // 3) Behind point uses the tangent (THIS is the slope step)
    const behindWorld = {
      x: bestClosest.x - ux * distanceWorld,
      y: bestClosest.y - uy * distanceWorld,
    };

    const closestLL = world.worldToLatLon(bestClosest.x, bestClosest.y);
    const behindLL = world.worldToLatLon(behindWorld.x, behindWorld.y);

    return {
      closest: [closestLL.lat, closestLL.lon],
      behind: [behindLL.lat, behindLL.lon],
      slopeWorld: [ux, uy],
      slopeWorldRaw: [tx, ty],
      segIndex: bestSeg,
      t: bestT,
    };
  }
}
