class PredictionBatch {
  constructor() {
    this.arrival_time = [];
    this.arrival_uncertainty = [];
    this.departure_time = [];
    this.departure_uncertainty = [];
    this.direction_id = [];
    this.last_trip = [];
    this.revenue = [];
    this.schedule_relationship = [];
    this.status = [];
    this.stop_sequence = [];
    // this.update_typex = [];

    this.vehicle_id = [];

    this.length = 0;
  }

  addPrediction(item) {
    // item.attributes = predictions.data[i].item.attributesibutes
    this.arrival_time.push(item.attributes.arrival_time || null);
    this.arrival_uncertainty.push(item.attributes.arrival_uncertainty ?? null);
    this.departure_time.push(item.attributes.departure_time || null);
    this.departure_uncertainty.push(
      item.attributes.departure_uncertainty ?? null
    );
    this.direction_id.push(item.attributes.direction_id ?? null);
    this.last_trip.push(item.attributes.last_trip ?? null);
    this.revenue.push(item.attributes.revenue ?? null);
    this.schedule_relationship.push(
      item.attributes.schedule_relationship ?? null
    );
    this.status.push(item.attributes.status ?? null);
    this.stop_sequence.push(item.attributes.stop_sequence ?? null);

    this.vehicle_id.push(item.relationships.vehicle.data ?? null);

    this.length++;
  }

  // Build a PredictionBatch from MBTA API predictions.data
  static fromApiData(dataArray) {
    const batch = new PredictionBatch();
    for (const item of dataArray) {
      batch.addPrediction(item);
    }
    return batch;
  }

  // Return formatted lines for the popup
  toPopupLines(maxLines = 5) {
    if (this.length === 0) {
      return ["No upcoming predictions."];
    }

    const lines = [];
    const count = Math.min(this.length, maxLines);

    for (let i = 0; i < count; i++) {
      const arr = this.arrival_time[i];
      const dep = this.departure_time[i];
      const dir = this.direction_id[i];

      let arrStr = arr ? this._formatTime(arr) : "—";
      let depStr = dep ? this._formatTime(dep) : "—";

      // Example line: "Dir 0  |  Arr: 3:15 PM  |  Dep: 3:17 PM"
      lines.push(`Dir ${dir ?? "?"}  |  Arr: ${arrStr}  |  Dep: ${depStr}`);
    }

    return lines;
  }

  _formatTime(isoString) {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString; // fallback if weird
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  _format;
}
