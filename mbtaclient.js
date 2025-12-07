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
    return this.fetchJSON(`vehicles`);
  }
}

// async function getRedLinePredictions() {
//   const resp = await fetch(`${MBTA_PROXY_BASE}/predictions?filter[stop]=70034`);
//   if (!resp.ok) {
//     console.error("Proxy error", resp.status);
//     return;
//   }
//   const data = await resp.json();
//   console.log("Predictions:", data);
//   // do all your fancy client-side stuff here
// }
