class Routes {
  constructor(id, hexcolor, description, direction_names, type) {
    this.id = id; // green, blue, b, silver, etc
    this.hexcolor = hexcolor;
    this.description = description; // type of vehicle
    this.direction_names = direction_names; // list of either out/in, south/west, north/east
    this.type = type; // 0 - 4, more in notes.txt
    this.shape = [];
  }
}
