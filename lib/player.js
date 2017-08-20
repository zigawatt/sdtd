class Player {
  /*:
  name: string
  attributes: Map<string,*>
  */

  constructor(name /*: string */, attributes /*: Map<string,*> */) {
    this.name = name;
    this.attributes = attributes;
  }
}

module.exports = {
  Player
};
