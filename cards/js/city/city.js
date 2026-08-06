import { Common, el } from "../common.js";
import { CityPlayers } from './cityplayer.js';
import { Html } from '../html.js';
import { Games } from '../games.js';
import { Players } from '../player.js';

export const City = {
    activeRoles : [],
    hoovergun: 0, //0: no Hoover and Watergun, 1: one of them is alive, 2: 2 of them are alive
    countdown: 0, //starts counting until 3 if Baker killed (actually, counting up, but it doesn't matter)
    nextPhase : function() {
        Games.stepPhase();
    },
    initGame : function() {
        for (let i = 0; i < Common.playerNum; i++) {
            Players.players[i].role = undefined;
            Players.players[i].roleShowed = false;
        }
        City.setPlayerRoleIcons();
        City.loadLastActiveRoles();
    },
    loadLastActiveRoles : function() {
        let lastActiveRoles = localStorage.getItem("cards.lastActiveRoles");
        if (lastActiveRoles) {
            City.activeRoles = JSON.parse(lastActiveRoles).map(r => CityPlayers.ROLES.find(role => role.id === r));
        }
    },
    fillChooseRoles : function() {
        el(Html.ACTIVE_ROLES).innerHTML = "";
        el(Html.PASSIVE_ROLES).innerHTML = "";
        for(let i = 0; i < CityPlayers.ROLES.length; i++) {
            let rImg = document.createElement('img');
            rImg.src = "img/" + CityPlayers.ROLES[i].img;
            rImg.className = Html.ROLE_ICON_CHOICE_CLASS;
            rImg.cityRole = CityPlayers.ROLES[i];
            rImg.title = CityPlayers.ROLES[i].nev;
            rImg.id = "picon_" + CityPlayers.ROLES[i].id;
            if (City.activeRoles.find(r => r.id === CityPlayers.ROLES[i].id) || CityPlayers.ROLES[i].basic) {
                el(Html.ACTIVE_ROLES).appendChild(rImg);
            } else {
                el(Html.PASSIVE_ROLES).appendChild(rImg);
            }
            rImg.onclick = City.moveRole;
        }
        City.checkRoles();
    },
    moveRole : function(evt) {
        let img = evt.target;
        let role = img.cityRole;
        let pair = role.id === 13 ? 14 : role.id === 14 ? 13 : false;
        let pairIcon = pair ? el("picon_"+pair) : null;
        if (role.basic) {
                return;
        }
        let parentDiv = img.parentElement;
        img.remove();
        if (pair) {
            el("picon_"+pair).remove;
        }
        if (parentDiv.id == Html.ACTIVE_ROLES) {
            el(Html.PASSIVE_ROLES).appendChild(img);
            if (pair) el(Html.PASSIVE_ROLES).appendChild(pairIcon);
        } else {
            el(Html.ACTIVE_ROLES).appendChild(img);
            if (pair) el(Html.ACTIVE_ROLES).appendChild(pairIcon);
        }
        City.checkRoles();
    },
    checkRoles : function() {
        let activeRolesDiv = el(Html.ACTIVE_ROLES);
        if (activeRolesDiv.children.length > Common.playerNum) {
            el(Html.ROLES_SELECTED_BUTTON).disabled = true;
            el(Html.CITIZEN_COUNT).innerHTML = "0";
            return;
        }
        el(Html.CITIZEN_COUNT).innerHTML = (Common.playerNum - activeRolesDiv.children.length).toString();
        el(Html.ROLES_SELECTED_BUTTON).disabled = false;
    },
    saveActiveRoles : function() {
        City.activeRoles = [];
        let activeRolesDiv = el(Html.ACTIVE_ROLES);
        for (let i = 0; i < activeRolesDiv.children.length; i++) {
            let child = activeRolesDiv.children[i];
            if (child.cityRole) {
                City.activeRoles.push(child.cityRole);
            }
        }
        localStorage.setItem("cards.lastActiveRoles", JSON.stringify(City.activeRoles.map(r => r.id)));
    },
    setPlayerRoleIcons : function() {
        for (let i = 0; i < Common.playerNum; i++) {
            let player = Players.players[i];
            if (player.role) {
                el(Html.ROLE_ICON + "_" + i).src = "img/" + player.role.img;
            } else {
                el(Html.ROLE_ICON + "_" + i).src = "img/severity-unknown-svgrepo-com.svg";
            }
        }
    },
    setRandomRoles : function() {
        for(let i = 0; i <= City.activeRoles.length - 1; i++) {
            let playerI = Math.floor(Math.random() * Common.playerNum);
            let [player, playerFoundIndex] = Players.findFreePlayer(playerI);
            City.activeRoles[i].player = player;
            player.role = City.activeRoles[i];
        }
        for(let i = 0; i < Common.playerNum; i++) {
            if (Players.players[i].role == undefined) {
                Players.players[i].role = CityPlayers.CITIZEN;
            }
            //TODO: Initialize Player objects based on Roles
        }
        City.setPlayerRoleIcons();
        console.log("Players: ", Players.players);
    },
    showPlayer : function(evt) {
        let target = evt.target;
        if (target.tagName == "IMG") {
            target = target.parentElement;
        }

        let id = target.id[Html.SHOW_PLAYER_CLASS.length + 1];
        if (id >= Common.playerNum) return;
        el(Html.SHOW_PLAYER_CLASS + "_" +id).style.backgroundColor = "rgb(118, 170, 118)";
        City.showRole(id);
    },
    showRole : function(playerI) {
        let player = Players.players[playerI];
        player.roleShowed = true;
        el(Html.SHOW_ROLE_WINDOW).style.display = "block";
        el(Html.SHOW_ROLE_NAME).innerHTML = player.name;
        el(Html.SHOW_ROLE_IMG).src = "img/" + player.role.img;
        el(Html.SHOW_ROLE_ROLE).innerHTML = player.role.nev.toUpperCase();
        el(Html.SHOW_ROLE_DESC).innerHTML = player.role.desc;
        City.enableNextButtonIfAllRolesShowed();
    },
    enableNextButtonIfAllRolesShowed : function() {
        let allShowed = true;
        for (let i = 0; i < Common.playerNum; i++) {
            if (!Players.players[i].roleShowed) {
                allShowed = false;
                break;
            }
        }
        el(Html.NEXT_BUTTON).disabled = !allShowed;
    },
    firstNightChameleon : function() {
        el(Html.FIRST_NIGHT_NEXT_BUTTON).disabled = true;
        let chameleon = Players.players.find(p => p.role == CityPlayers.CHAMELEON);
        if (chameleon) {
            el(Html.FIRST_NIGHT_CHAMELEON).style.display = "block";
            el(Html.FIRST_NIGHT_CHAMELEON_BUTTON).onclick = () => {
                City.showRole(el(Html.CHAMELEON_SELECT).value);
                City.firstNightDirector();
            };
            for (let i = 0; i < Common.playerNum; i++) {
                if (Players.players[i].role != CityPlayers.CHAMELEON) {
                    el(Html.CHAMELEON_SELECT).innerHTML += "<option value='" + i + "'>" + Players.players[i].name + "</option>";
                }
            }
        } else {
            City.firstNightDirector();
        }
    },
    firstNightDirector : function() {
        let director = Players.players.find(p => p.role == CityPlayers.DIRECTOR);
        if (director) {
            el(Html.FIRST_NIGHT_CHAMELEON).style.display = "none";
            el(Html.FIRST_NIGHT_DIRECTOR).style.display = "block";
            el(Html.FIRST_NIGHT_DIRECTOR_BUTTON).onclick = () => {
                City.showRole(el(Html.DIRECTOR_SELECT).value);
                City.firstNightKillersMeeting();
            };
            for (let i = 0; i < Common.playerNum; i++) {
                if (Players.players[i].role != CityPlayers.DIRECTOR) {
                    el(Html.DIRECTOR_SELECT).innerHTML += "<option value='" + i + "'>" + Players.players[i].name + "</option>";
                }
            }
        } else {
            City.firstNightKillersMeeting();
        }
    },
    firstNightKillersMeeting : function() {
        el(Html.FIRST_NIGHT_DIRECTOR).style.display = "none";
        el(Html.FIRST_NIGHT_CHAMELEON).style.display = "none";
        el(Html.FIRST_NIGHT_KILLERS_MEETING).style.display = "block";
        el(Html.FIRST_NIGHT_KILLERS_MEETING_BUTTON).style.display = "none";
        el(Html.FIRST_NIGHT_NEXT_BUTTON).disabled = false;
        el(Html.FIRST_NIGHT_NEXT_BUTTON).onclick = () => {
            el(Html.FIRST_NIGHT_OVERLAY).style.display = "none";
            Games.stepPhase();
        }
    },
    hangPlayer : function(evt) {
        let target = evt.target;
        if (target.tagName == "IMG") {
            target = target.parentElement;
        }
        let id = target.id[Html.HANG_PLAYER_BUTTON.length + 1];
        if (id >= Common.playerNum) return;
        if (Players.players[id].alive === false) return;
        Players.players[id].alive = false;
        let lover = Players.players[id].lover;
        if (lover > -1) Players.players[lover].alive = false;
        //TODO: GM:announce other death
        el(Html.BOX + id).style.backgroundColor = "rgb(107, 92, 92)";
        el(Html.NAME + id).style.color = "rgb(0,0,0)";
        //TODO check and of game, show winner
        Games.stepPhase();
    }
};