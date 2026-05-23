// Players
const Players = window.Players = window.Players || Object.create(null);

Players.players = []; // Player objects
const PLAYERS_STORAGE_KEY = "cards.players";
const LAST_PLAYERS_STORAGE_KEY = "cards.lastPlayers";
Players.lastPlayers = []; // stores the actual player list, stored as lastPlayers

Players.Player = class Player {
    constructor(name) {
        this.name = name;
    }
};

Players.addPlayer = function (playerName) {
    let player = Players.findPlayer(playerName);
    if (player == undefined) {
        player = new Players.Player(playerName);
        Players.players.push(player);
        Players.saveStoredPlayers();
        Engine.fn.runPhase();
    }
    return player;
};

Players.findPlayer = function (playerName) {
    let player = Players.players.find(p => p.name == playerName);
    return player;
};

Players.readStoredPlayers = function () {
    let item = localStorage.getItem(PLAYERS_STORAGE_KEY);
    if (item == undefined || item == null) {
        item = "[]";
    }
    Players.players = JSON.parse(item);
};

Players.readLastPlayers = function() {
    let item = localStorage.getItem(LAST_PLAYERS_STORAGE_KEY);
    if (item == undefined || item == null) {
        item = "[]";
    }
    Players.lastPlayers = JSON.parse(item);
    for(let i = 0; i < Players.lastPlayers.length; i++) {
        doAddPlayer(Players.lastPlayers[i]);
    }
};

Players.saveStoredPlayers = function () {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(Players.players));
};

Players.writeLastPlayersToStore = function () {
    localStorage.setItem(LAST_PLAYERS_STORAGE_KEY, JSON.stringify(Players.lastPlayers));
};

Players.addLastPlayer = function (name) {
    if (Players.lastPlayers.indexOf(name) == -1) {
        Players.lastPlayers.push(name);
        Players.writeLastPlayersToStore();
    }
};