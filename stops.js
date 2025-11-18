class Stops {
  constructor(name, latitude, longitude, type) {
    this.name = name;
    this.latitude = latitude; // some lat/long has nulls
    this.longitude = longitude;
    this.type = type; // prob a list
    this.circleSize = 10; //change later idk
    this.x = 0;
    this.y = 0;
  }
}
