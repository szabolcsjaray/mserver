import {Engine} from './engine.js';
import { doAddPlayer } from './cards.js';

// Players
export const Players = {};

Players.players = []; // Player objects
const PLAYERS_STORAGE_KEY = "cards.players";
const LAST_PLAYERS_STORAGE_KEY = "cards.lastPlayers";
Players.lastPlayers = []; // stores the actual player list, stored as lastPlayers

Players.Player = class Player {
    constructor(name) {
        this.name = name;
        this.alive = true;
        this.role = undefined;
        this.roleShowed = false;
        this.evil = false; //gyilkos maffiavezér vagy féltestvér
        this.gmnight = 0; //game master mentions during normal round of night: 0 - skip, 1 - only if both alive, 2 - even if dead
        this.winalone = false; //if true, player can win alone (clown, hoover, forecaster)
        this.chameleon = false; 
        this.killed = false; //to be killed (by evils or witch) at night
        this.saved = false; //to be saved (by doctor, witch or neighbor) at night
        this.lover = []; //id of lover(s) connected by cupid(s)
        this.preneigh = -1; //id of previous target of Neighbor
        this.getHoover = false; //gets hoover at night
        this.gaveHoover = []; //people given a hoover by the Hoover
        this.resurrected = false; //will become alive the next morning
        this.usedResurrect = false; //priest used resurrect
        this.forecast = -1; //forecasted end day
        this.potions = 0; //witch's potions
    }
};

Players.addPlayer = function (playerName) {
    let player = Players.findPlayer(playerName);
    if (player == undefined) {
        player = new Players.Player(playerName);
        Players.players.push(player);
        Players.saveStoredPlayers();
    }
    Engine.runPhase();
    return player;
};

Players.findPlayer = function (playerName) {
    let player = Players.players.find(p => p.name == playerName);
    return player;
};

Players.readStoredPlayers = function () {
    let playrNamesArrayString = localStorage.getItem(PLAYERS_STORAGE_KEY);
    if (playrNamesArrayString == undefined || playrNamesArrayString == null) {
        Players.players = [];
        return;
    }
    let playerNamesArray;
    try {
        playerNamesArray = JSON.parse(playrNamesArrayString);
    } catch (e) {
        Players.players = [];
        return;
    }
    if (typeof playerNamesArray != "array" || playerNamesArray.length == 0
        || typeof playerNamesArray[0] != "string") {
        playerNamesArray = [];
        Players.players = [];
    }
    playerNamesArray.forEach(name => {
        Players.players.push(new Players.Player(name));
    });
};

Players.readLastPlayers = function() {
    let item = localStorage.getItem(LAST_PLAYERS_STORAGE_KEY);
    if (item == undefined || item == null) {
        item = "[]";
    }
    Players.lastPlayers = JSON.parse(item);
    if (item.length > 0) {
        for(let i = 0; i < Players.lastPlayers.length; i++) {
            doAddPlayer(Players.lastPlayers[i]);
        }
    }
};

Players.saveStoredPlayers = function () {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(Players.players.map(p => p.name)));
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

Players.findFreePlayer = function (playerI) {
    let direnction = (Math.random() < 0.5) ? -1 : 1;
    while (Players.players[playerI].role != undefined) {
        playerI += direnction;
        if (playerI < 0) {
            playerI = Players.players.length - 1;
        }
        if (playerI >= Players.players.length) {
            playerI = 0;
        }
    }
    return [Players.players[playerI], playerI];
};