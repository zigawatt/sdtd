/*
0. id=171, Spanners, pos=(-2077.2, 156.5, -532.2), rot=(0.0, 246.1, 0.0), remote=True, health=79, deaths=2, zombies=0, players=0, score=0, level=1, steamid=76561197964314597, ip=127.0.0.1, ping=48
*/

/*:
type PlayerAttribute =
  'health'
  | 'deaths'
  | 'zombies'
  | 'score'
  | 'level'
  | 'steamid'
  | 'ip'
  | 'ping'
*/


class Player {
  /*:
  name: string
  attributes: Map<PlayerAttribute,*>
  */

  constructor(name /*: string */, attributes /*: Map<PlayerAttribute,*> */) {
    this.name = name;
    this.attributes = attributes;
  }
}

module.exports = {
  Player
};
