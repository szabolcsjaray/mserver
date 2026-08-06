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
        this.evil = false; //gyilkos vagy maffiavezér
        this.chameleon = false; 
        this.killed = false; //to be killed (by evils or witch) at night
        this.saved = false; //to be saved (by doctor, witch or neighbor) at night
        this.lover = -1; //id of lover connected by cupid
        this.neighbor = -1; //id of current target of Neighbor
        this.preneigh = -1; //id of previous target of Neighbor
        this.getHoover = false; //gets hoover at night
        this.getWater = false; //gets watergun shot at night
    }
};

Players.addPlayer = function (playerName) {
    let player = Players.findPlayer(playerName);
    if (player == undefined) {
        player = new Players.Player(playerName);
        Players.players.push(player);
        Players.saveStoredPlayers();
        Engine.runPhase();
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