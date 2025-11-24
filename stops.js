class Stops {
  constructor({
    name,
    latitude,
    longitude,
    address,
    at_street,
    description,
    location_type,
    municipality,
    on_street,
    platform_code,
    platform_name,
    vehicle_type,
    wheelchair_boarding,
  }) {
    this.name = name;
    this.latitude = latitude; // can be null
    this.longitude = longitude; // can be null

    this.address = address;
    this.at_street = at_street;
    this.description = description;
    this.location_type = location_type;
    this.municipality = municipality;
    this.on_street = on_street;
    this.platform_code = platform_code;
    this.platform_name = platform_name;
    this.vehicle_type = vehicle_type;
    this.wheelchair_boarding = wheelchair_boarding;

    this.circleSize = 5;
    this.x = 0;
    this.y = 0;
  }
}
