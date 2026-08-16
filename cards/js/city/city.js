import { Common, el, getObj, getObjs, getObjsC, delItemDeep } from "../common.js";
import { CityPlayers, NightOrder } from './cityplayer.js';
import { Html } from '../html.js';
import { Games } from '../games.js';
import { Players } from '../player.js';

export const City = {
    testMode : true, //TODO: false if game is ready
    activeRoles : [],
    hoovergun: 0, //0: no Hoover and Watergun, 1: one of them is alive, 2: 2 of them are alive
    day: 0,
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
            let p = Players.players[i];
            switch (p.role) {
                case undefined:
                    p.role = CityPlayers.CITIZEN;
                    break;
                
                case CityPlayers.CHAMELEON:
                    p.chameleon = true;
                    break;
            
                case CityPlayers.HOOVER:
                    City.hoovergun++;
                    break;
            
                case CityPlayers.WATERGUN:
                    City.hoovergun++;
                    break;
            
                default:
                    break;
            }
            p.evil = p.role.evil;
            p.gmnight = p.role.gmnight;
            p.winalone = p.role.winalone;
        }

        City.setPlayerRoleIcons();
        //TODO: TEST Hunglover - remove later
        //Players.players[0].lover = 1;
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
        console.log("PR: ", player.role);
        let shr = player.role.nev.toUpperCase();
        if (player.chameleon && player.role != CityPlayers.CHAMELEON) {
            shr += "<br><span id='chameleon-text'>(kaméleon)</span>";
        }
        el(Html.SHOW_ROLE_WINDOW).style.display = "block";
        el(Html.SHOW_ROLE_NAME).innerHTML = player.name;
        el(Html.SHOW_ROLE_IMG).src = "img/" + player.role.img;
        el(Html.SHOW_ROLE_ROLE).innerHTML = shr;
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
        if (!City.testMode) {
            el(Html.NEXT_BUTTON).disabled = !allShowed;
        } else {
            el(Html.NEXT_BUTTON).disabled = false;
        }
    },
    testTestMode : function() {
        if (City.testMode) {
            el(Html.NEXT_BUTTON).disabled = false;
        }
    },
    firstNightChameleon : function() {
        el(Html.FIRST_NIGHT_NEXT_BUTTON).disabled = true;
        let chameleon = Players.players.find(p => p.role == CityPlayers.CHAMELEON);
        if (chameleon) {
            el(Html.FIRST_NIGHT_CHAMELEON).style.display = "block";
            el(Html.FIRST_NIGHT_CHAMELEON_BUTTON).onclick = () => {
                let crole = el(Html.CHAMELEON_SELECT).value;
                City.showRole(crole);
                chameleon.role = Players.players[crole].role;
                chameleon.evil = chameleon.role.evil;
                chameleon.gmnight = chameleon.role.gmnight;
                chameleon.winalone = chameleon.role.winalone;
                if (chameleon.role == CityPlayers.DIRECTOR) {
                    City.firstNightDirector(true);
                } else if (chameleon.role == CityPlayers.FORECASTER) {
                    City.firstNightForecaster(true);
                } else {
                    City.firstNightKillersMeeting();
                }
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
    firstNightDirector : function(cham=false) {
        let directors = getObjs(Players.players, "role", CityPlayers.DIRECTOR);
        if (directors.length > 0) {
            let director = getObj(directors, "chameleon", cham);
            el(Html.FIRST_NIGHT_CHAMELEON).style.display = "none";
             el(Html.FIRST_NIGHT_FORECASTER).style.display = "none";
            el(Html.FIRST_NIGHT_DIRECTOR).style.display = "block";
            if (cham) {
                el('igQ').innerHTML = "a Kaméleon";
            } else {
                el('igQ').innerHTML = "az";
            }
            
            el(Html.DIRECTOR_SELECT).innerHTML = "";
            for (let i = 0; i < Common.playerNum; i++) {
                if (cham) {
                    if (Players.players[i].role != CityPlayers.DIRECTOR && Players.players[i].role != CityPlayers.CHAMELEON) {
                        el(Html.DIRECTOR_SELECT).innerHTML += "<option value='" + i + "'>" + Players.players[i].name + "</option>";
                    }
                } else {
                    if (Players.players[i].role != CityPlayers.DIRECTOR || Players.players[i].chameleon) {
                    el(Html.DIRECTOR_SELECT).innerHTML += "<option value='" + i + "'>" + Players.players[i].name + "</option>";
                    }
                }
            }

            el(Html.FIRST_NIGHT_DIRECTOR_BUTTON).onclick = () => {
                City.showRole(el(Html.DIRECTOR_SELECT).value);
                if (cham) {
                City.firstNightDirector();
                } else {
                City.firstNightForecaster();
                }
            };
        } else {
                City.firstNightForecaster();
        }
    },
    firstNightForecaster : function(cham=false) {
        let forecasters = getObjs(Players.players, "role", CityPlayers.FORECASTER);
        if (forecasters.length > 0) {
            let forecaster = getObj(forecasters, "chameleon", cham);
            let fv = 0;
            el(Html.FIRST_NIGHT_CHAMELEON).style.display = "none";
            el(Html.FIRST_NIGHT_DIRECTOR).style.display = "none";
            el(Html.FIRST_NIGHT_FORECASTER).style.display = "block";
            if (cham) {
                el('fcQ').innerHTML = "a Kaméleon";
            } else {
                el('fcQ').innerHTML = "az";
            }
            el(Html.FORECASTER_INPUT).onchange = () => {
                fv = Math.abs(parseInt(el(Html.FORECASTER_INPUT).value));
                fv = fv < 1 ? 1 : fv > 20 ? 20 : fv;
                el(Html.FORECASTER_INPUT).value = fv;
            };
            el(Html.FIRST_NIGHT_FORECASTER_BUTTON).onclick = () => {
                forecaster.forecast = fv;
                if (cham) {
                    City.firstNightDirector();
                } else {
                    City.firstNightKillersMeeting();
                }
                
            };
        } else {
            City.firstNightKillersMeeting();
        }
    },
    
    firstNightKillersMeeting : function() {
        el(Html.FIRST_NIGHT_DIRECTOR).style.display = "none";
        el(Html.FIRST_NIGHT_CHAMELEON).style.display = "none";
        el(Html.FIRST_NIGHT_FORECASTER).style.display = "none";
        el(Html.FIRST_NIGHT_KILLERS_MEETING).style.display = "block";
        el(Html.FIRST_NIGHT_KILLERS_MEETING_BUTTON).style.display = "none";
        el(Html.FIRST_NIGHT_NEXT_BUTTON).disabled = false;
        el(Html.NEXT_BUTTON).disabled = false;
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
        if (lover > -1) {
            Players.players[lover].alive = false;
            el(Html.DAY_OVERLAY).style.display="block";
            el(Html.HUNG_LOVER_NAME).innerHTML = Players.players[lover].name;
            el(Html.BOX + lover).style.backgroundColor = "rgb(107, 92, 92)";
            el(Html.NAME + lover).style.color = "rgb(0,0,0)";
            el(Html.DAY_NEXT_BUTTON).onclick = () => {
               el(Html.DAY_OVERLAY).style.display = "none";
            }
        }
        el(Html.BOX + id).style.backgroundColor = "rgb(107, 92, 92)";
        el(Html.NAME + id).style.color = "rgb(0,0,0)";
        //TODO check end of game (also forecast), show winner
        Games.stepPhase();
    },
    nightMurder : function() {
        console.log("Night murder phase");
        el(Html.NIGHT_OVERLAY).style.display = "block";
        el(Html.NE_MESSAGE).innerHTML = `Kit öltek meg a gyilkosok az éjszaka folyamán?`;
        el(Html.NE_SELECT).innerHTML = "";
        el(Html.NE_SELECT).style.display = "block";
        for (let i = 0; i < Common.playerNum; i++) {
            let p = Players.players[i];
            if (p.alive === true ) {
                el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
            }
        }
        el(Html.NE_BUTTON).onclick = () => {
            let sid = Number(el(Html.NE_SELECT).value);
            let hulla = Players.players[sid];
            hulla.killed = true;
            console.log('hulla: ', hulla);
            City.nightActions();
        }
    },
    nightActions : function() {
        let naList0 = getObjsC(Players.players, "gmnight", ">0");
        let naList = [];
        if (City.hoovergun < 2) {
            delItemDeep(naList0, "gmnight", 1);
        }
        for (let i = 0; i < NightOrder.length; i++) {
            let rid = NightOrder[i];
            let p = getObj(naList0, "role", rid);
            if (p) {
                naList.push(p);
            }
        } 
        let nalCount = 0;
        
        el(Html.NE_BUTTON).onclick = () => {
            City.nightActionResult(naList[nalCount]);
            nalCount++;
            if (nalCount < naList.length) {
                City.realAction(naList[nalCount]);
            } else {
                el(Html.NIGHT_OVERLAY).style.display = "none";
                Games.stepPhase();
            }
        }

        City.realAction(naList[nalCount]);
    },
    realAction : (actP, cham=false) => {
        let ms = actP.role.nightSpeech;
        el(Html.NE_SELECT).innerHTML = "";
        el(Html.NE_SELECT2).innerHTML = "";
        el(Html.NE_SELECT).style.display = "none";
        el(Html.NE_SELECT2).style.display = "none";
        if (actP.alive === false) {
            ms =+ "<br>(csak mondd, mivel meghalt)";
            el(Html.NE_MESSAGE).innerHTML = ms;
            return;
        }
        el(Html.NE_MESSAGE).innerHTML = ms;
        
        switch (actP.role) {
            case CityPlayers.WITCH:
                el(Html.NE_SELECT).style.display = "block";
                el(Html.NE_SELECT2).style.display = "block";
                el(Html.NE_SELECT).innerHTML += "<option value='0'>Gyógyital</option><option value='1'>Méreg</option>";
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (p.alive) {
                        el(Html.NE_SELECT2).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                break;
            
            case CityPlayers.DOCTOR:
                el(Html.NE_SELECT).style.display = "block";
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (p.alive) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                break;

            case CityPlayers.POLICE:
                el(Html.NE_SELECT).style.display = "block";
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (cham) {
                        if (p.alive && !p.chameleon) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                        } 
                    } else {
                        if (p.alive && (p.role != CityPlayers.POLICE || p.chameleon)) {
                            el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                        }
                    }
                }
                break;

            default:
                break;

        }
    },
    nightActionResult : function(player) {
        switch (player.role) {
            case CityPlayers.WITCH:
                let wact = el(Html.NE_SELECT).value;
                let wtarget = el(Html.NE_SELECT2).value;
                let wtargetP = Players.players[wtarget];
                if (wact == 0) {
                    wtargetP.saved = true;
                } else if (wact == 1) {
                    wtargetP.killed = true;
                }
                console.log("Witch action: ", wact, " on ", wtargetP);
                break;
            
            case CityPlayers.DOCTOR:
                let dtarget = el(Html.NE_SELECT).value;
                let dtargetP = Players.players[dtarget];
                dtargetP.saved = true;
                console.log("Doctor action on ", dtargetP);
                break;

            case CityPlayers.POLICE:
                let ptarget = el(Html.NE_SELECT).value;
                City.showRole(ptarget);
                console.log("Police action on ", ptarget);
                break;
            
            default:
                break;
        }
    },
    nightChameleon : function() {
        let chamel = Players.players.find(p => p.chameleon);
    },
    morningCalculations : function() {
        City.day++;
        //TODO: all calculations
    }
};