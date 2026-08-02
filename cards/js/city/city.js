import { Common, el } from "../common.js";
import { CityPlayers } from './cityplayer.js';
import { Html } from '../html.js';
import { Games } from '../games.js';
import { Players } from '../player.js';

export const City = {
    activeRoles : [],
    nextPhase : function() {
        Games.stepPhase();
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
            el(Html.ACTIVE_ROLES).appendChild(rImg);
            rImg.onclick = City.moveRole;
        }
    },
    moveRole : function(evt) {
        let img = evt.target;
        let parentDiv = img.parentElement;
        img.remove();
        if (parentDiv.id == Html.ACTIVE_ROLES) {
            el(Html.PASSIVE_ROLES).appendChild(img);
        } else {
            el(Html.ACTIVE_ROLES).appendChild(img);
        }
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
    },
    setRandomRoles : function() {
        for(let i = 0; i <= City.activeRoles.length - 1; i++) {
            let playerI = Math.floor(Math.random() * Common.playerNum);
            let [player, playerFoundIndex] = Players.findFreePlayer(playerI);
            City.activeRoles[i].player = player;
            player.role = City.activeRoles[i];
            el(Html.ROLE_ICON + "_" + playerFoundIndex).src = "img/" + City.activeRoles[i].img;
        }
    },
    showPlayer : function(evt) {
        let id = evt.target.id[Html.SHOW_PLAYER_CLASS.length + 1];
        if (id >= Common.playerNum) return;
        el(Html.SHOW_PLAYER_CLASS + "_" +id).style.backgroundColor = "#060";
        City.showRole(id);
    },
    showRole : function(playerI) {
        let player = Players.players[playerI];
    }
}