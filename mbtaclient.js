class MBTAClient {
  constructor(baseURL = "https://my-api-proxy.augurship.workers.dev") {
    this.baseURL = baseURL; // your Cloudflare Worker URL
  }

  async fetchJSON(pathAndQuery) {
    const url = `${this.baseURL}/${pathAndQuery}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`MBTAClient error: ${resp.status}`);
    return resp.json();
  }

  getPredictionFromStopID(stopid) {
    return this.fetchJSON(`predictions?filter[stop]=${stopid}`);
  }

  getVehicleFromStopPredictions(vehicleid) {
    return this.fetchJSON(`vehicles?filter[id]=${vehicleid}`);
  }

  getVehicleData() {
    // console.log("getting all data");
    return this.fetchJSON(`vehicles`);
  }
}
