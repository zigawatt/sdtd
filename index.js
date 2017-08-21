/**
# zigawat-sdtd

A simple module for querying useful information from a
[7 Days to Die](https://7daystodie.gamepedia.com/7_Days_to_Die_Wiki) game server via
the telnet interface.
**/

const { Player } = require('./lib/player');
const Telnet = require('telnet-client');

const REGEX_POSDATA = /pos=\(.*?\),\s/;
const REGEX_ROTDATA = /rot=\(.*?\),\s/;
const REGEX_LEADING_INDEX = /^\d+\.\s/;
const REGEX_SERVER_VERSION_LEADER = /^game version:\s?/i;

class GameQuery {
  constructor(connection) {
    this.connection = connection;
  }

  static async forServer(ip /*: string */, password /*: string */) {
    const connection = new Telnet();
    const params = {
      host: ip,
      port: 8081,
      shellPrompt: '',
      username: '',
      password: password,
      passwordPrompt: 'Please enter password:'
    };

    return new Promise((resolve, reject) => {
      connection.on('error', err => {
        unbindListeners();
        reject(err)
      });

      connection.on('ready', () => {
        unbindListeners();
        resolve(new GameQuery(connection));
      })

      connection.connect(params);
    });

    function unbindListeners() {
      connection.removeAllListeners('error');
      connection.removeAllListeners('ready');
    }
  }

  async listPlayers() {
    const response = await this.connection.send('lp\n', {
      waitfor: 'in the game'
    });

    // get the list of players without the summary line
    const playerList = this.getCommandOutput('lp', response).slice(0, -1);

    // iterate through the player list and part out the player data
    return playerList.map(raw => GameQuery.parsePlayerData(raw));
  }

  async getTime() {
    const response = await this.connection.send('gettime\n', {
      waitfor: 'Day'
    });

    return this.getCommandOutput('gettime', response)[0] || '';
  }

  async getVersion() {
    const response = await this.connection.send('version\n', {
      waitfor: 'Game version:'
    });

    return (this.getCommandOutput('version', response)[0] || '')
      .replace(REGEX_SERVER_VERSION_LEADER, '');
  }

  async disconnect() {
    await this.connection.send('exit\n', {
      waitfor: '',
      timeout: 100
    });

    this.connection.end();
  }

  getCommandOutput(command, response) {
    const lines = response.split(/\r?\n/).filter(Boolean);
    const execLine = lines.findIndex(line => {
      return line.includes(`Executing command '${command}'`);
    });

    if (execLine < 0) {
      return [];
    }

    return lines.slice(execLine + 1);
  }

  static parsePlayerData(raw /*: string */) {
    // strip out unhelpful characters
    const input = raw
      .replace(REGEX_POSDATA, '')
      .replace(REGEX_ROTDATA, '')
      .replace(REGEX_LEADING_INDEX, '');

    const playerFields = input.split(', ');
    const playerName = playerFields.splice(1, 1)[0];
    const dataMap = playerFields.reduce((memo, attr) => {
      const [key, value] = attr.split('=');

      return memo.concat([[key, parseInt(value, 10) || value]]);
    }, []);

    return new Player(playerName, new Map(dataMap));
  }
}

module.exports = {
  GameQuery,
  Player
};
