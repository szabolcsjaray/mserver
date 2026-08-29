import { Common, el, getObj, getObjs, getObjsC, delItemDeep, checkItem, checkItemDeep, delItem,smartList, rnd } from "../common.js";
import { CityPlayers, NightOrder } from './cityplayer.js';
import { Html } from '../html.js';
import { Games } from '../games.js';
import { Players } from '../player.js';
import { States } from "../states.js";

export const City = {
    testMode : true, //TODO: false if game is ready
    activeRoles : [],
    hoovergun: 0, //0: no Hoover and Watergun, 1: one of them is alive, 2: 2 of them are alive
    chamhooverXtra: [], //who previously 0: getHoover, 1: getWater, 2: double hoover
    day: 0,
    hungerEnd : -1, //when no more bakers
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
                
                case CityPlayers.WITCH:
                    p.potions = Math.floor(Common.playerNum * Math.random() / 3);
                    break;
            
                default:
                    break;
            }
            p.evil = p.role.evil;
            p.gmnight = p.role.gmnight;
            p.winalone = p.role.winalone;
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
            el("fncN").innerHTML = chameleon.name;
            el(Html.FIRST_NIGHT_CHAMELEON_BUTTON).onclick = () => {
                let crole = el(Html.CHAMELEON_SELECT).value;
                City.showRole(crole);
                chameleon.role = Players.players[crole].role;
                chameleon.evil = chameleon.role.evil;
                chameleon.winalone = chameleon.role.winalone;
                if (chameleon.role == CityPlayers.DIRECTOR) {
                    City.firstNightDirector(true);
                } else if (chameleon.role == CityPlayers.FORECASTER) {
                    City.firstNightForecaster(true);
                } else if (chameleon.role == CityPlayers.HALFBRO) {
                    City.firstNightHalfbro(true);
                } else {
                    City.firstNightDirector();
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
            el(Html.FIRST_NIGHT_HALFBRO).style.display = "none";
            el(Html.FIRST_NIGHT_DIRECTOR).style.display = "block";
            el("fndN").innerHTML = director.name;
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
            el(Html.FIRST_NIGHT_HALFBRO).style.display = "none";
            el(Html.FIRST_NIGHT_FORECASTER).style.display = "block";
            el("fnfN").innerHTML = forecaster.name;
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
                    City.firstNightHalfbro();
                }
                
            };
        } else {
            City.firstNightHalfbro();
        }
    },
    firstNightHalfbro : function(cham=false) {
        let halfbros = getObjs(Players.players, "role", CityPlayers.HALFBRO);
        if (halfbros.length > 0) {
            let halfbro = getObj(halfbros, "chameleon", cham);
            el(Html.FIRST_NIGHT_DIRECTOR).style.display = "none";
            el(Html.FIRST_NIGHT_CHAMELEON).style.display = "none";
            el(Html.FIRST_NIGHT_FORECASTER).style.display = "none";
            el(Html.FIRST_NIGHT_HALFBRO).style.display = "block";
            el("fnhN").innerHTML = halfbro.name;
            el(Html.FIRST_NIGHT_KILLIST).innerHTML = "";
            if (cham) {
                hbQ.innerHTML = "Kaméleon ";
            } else {
                hbQ.innerHTML = "";
            }
            for (let i = 0; i < Common.playerNum; i++) {
                let p = Players.players[i];
                if (p.role == CityPlayers.KILLER || p.role == CityPlayers.MAFFIA) {
                    el(Html.FIRST_NIGHT_KILLIST).innerHTML += `- ${p.name}<br>`;
                }
            }       
            el(Html.FIRST_NIGHT_HALFBRO_BUTTON).onclick = () => {
                if (cham) {
                City.firstNightDirector();
                } else {
                    City.firstNightKillersMeeting();
                }
            }
        } else {
            City.firstNightKillersMeeting();
        }
    },
    firstNightKillersMeeting : function() {
        el(Html.FIRST_NIGHT_DIRECTOR).style.display = "none";
        el(Html.FIRST_NIGHT_CHAMELEON).style.display = "none";
        el(Html.FIRST_NIGHT_FORECASTER).style.display = "none";
        el(Html.FIRST_NIGHT_HALFBRO).style.display = "none";
        el(Html.FIRST_NIGHT_KILLERS_MEETING).style.display = "block";
        el(Html.FIRST_NIGHT_KILLERS_MEETING_BUTTON).style.display = "none";
        el(Html.FIRST_NIGHT_NEXT_BUTTON).disabled = false;
        el(Html.NEXT_BUTTON).disabled = false;

        let killers = [];
        for (let i = 0; i < Common.playerNum; i++) {
            let p = Players.players[i];
            if (p.role == CityPlayers.KILLER || p.role == CityPlayers.MAFFIA) {
                killers.push(p.name);
            }
        }
        el("fnkN").innerHTML = smartList(killers);

        el(Html.FIRST_NIGHT_NEXT_BUTTON).onclick = () => {
            el(Html.FIRST_NIGHT_OVERLAY).style.display = "none";
            Games.stepPhase();
        }
    },
    findLovers : function(id) {
        let allLovers = Players.players[id].lover;
        if (allLovers.length> 0) {
            for (const al of allLovers) {
                for (const al2 of Players.players[al].lover) {
                    if (!checkItem(allLovers, al2) && Players.players[al2].alive && al2 != id) allLovers.push(al2);
                }
            }
        }
        return allLovers;
    },
    hangPlayer : function(evt) {
        let target = evt.target;
        if (target.tagName == "IMG") {
            target = target.parentElement;
        }
        let id = target.id[Html.HANG_PLAYER_BUTTON.length + 1];
        if (id >= Common.playerNum) return;
        let checkDead = [id];
        let hungman = Players.players[id];
        if (hungman.alive === false) return;
        hungman.alive = false;
        let lovers = City.findLovers(id);
        if (lovers.length > 0){
            checkDead = checkDead.concat(lovers);
            el(Html.DAY_OVERLAY).style.display="block";
            let sl = [];
            for (let i = 0; i < lovers.length; i++) {
                const lover = lovers[i];
                Players.players[lover].alive = false;
                sl.push(Players.players[lover].name);
                el(Html.BOX + lover).classList.add("deadPlayer");
            }
            el(Html.HUNG_LOVER_NAME).innerHTML = smartList(sl) + " is meghalt szerelmi bánatában!";
            el(Html.DAY_NEXT_BUTTON).onclick = () => {
               el(Html.DAY_OVERLAY).style.display = "none";
            }
        }
        el(Html.BOX + id).classList.add("deadPlayer");
        if (hungman.role == CityPlayers.CLOWN) {
            City.checkCityEnd([id]);
        }
        City.checkDeathFollowup(checkDead);
        let end = City.checkCityEnd();
        if (!end) Games.stepPhase();
    },
    nightMurder : function() {
        console.log("Night murder phase");
        Players.players.map((p) => {
            p.lover = [];
            p.killed = false;
            p.saved = false;
            p.getHoover = false; 
            p.resurrected = false;
        });
        el(Html.GAME_END_MORNING).innerHTML = "";
        el(Html.NIGHT_OVERLAY).style.display = "block";
        el(Html.NIGHT_EVENT).style.display = "block";
        el(Html.NIGHT_NEXT_BUTTON).style.display = "none";
        el(Html.NE_MESSAGE).innerHTML = `Kit öltek meg a gyilkosok az éjszaka folyamán?`;
        el(Html.NE_SELECT).innerHTML = "<option value='-1'>Senkit</option>";
        el(Html.NE_SELECT).style.display = "block";
        el(Html.NE_SELECT2).style.display = "none";
        el(Html.NE_SELECT).removeEventListener("change", City.witchSelectHandle);
        el(Html.NE_SELECT).removeEventListener("change", City.cupidSelectHandle);
        el(Html.NE_SELECT).disabled = false;
        for (let i = 0; i < Common.playerNum; i++) {
            let p = Players.players[i];
            if (p.alive === true ) {
                el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
            }
        }
        el(Html.NE_BUTTON).onclick = () => {
            el(Html.GAME_END_DAY).innerHTML = "";
            el(Html.GAME_END_MORNING).innerHTML = "";
            let sid = Number(el(Html.NE_SELECT).value);
            if (sid < 0) { City.nightActions();} 
            else {
                let hulla = Players.players[sid];
                hulla.killed = true;
                City.nightActions();
            }
        }
    },
    nightActions : function() {
        City.chamhooverXtra = [];
        let naList0 = getObjsC(Players.players, "gmnight", ">0");
        let naList = [];
        if (City.hoovergun < 2) {
            delItemDeep(naList0, "gmnight", 1);
        }
        if (!checkItemDeep(Players.players, "alive", false)) {
            delItemDeep(naList0, "role", CityPlayers.PRIEST)
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
            if (naList[nalCount].alive) City.nightActionResult(naList[nalCount]);
            nalCount++;
            if (nalCount < naList.length) {
                City.realAction(naList[nalCount]);
            } else {
                let chame = checkItemDeep(Players.players, "chameleon", true);
                if (chame) {
                    City.nightChameleon()
                } else {
                    el(Html.NIGHT_EVENT).style.display = "none";
                    el(Html.NIGHT_NEXT_BUTTON).style.display = "block";
                    el(Html.NIGHT_NEXT_BUTTON).onclick = () => {
                        el(Html.NIGHT_OVERLAY).style.display = "none";
                        Games.stepPhase();
                    }
                }
            }
        }
        
        City.realAction(naList[nalCount]);
    },
    witchSelectHandle : () => {
            if (el(Html.NE_SELECT).value > 0) {
                el(Html.NE_SELECT2).style.visibility = "visible";
            } else {
                el(Html.NE_SELECT2).style.visibility = "hidden";
            }
        },
    cupidSelectHandle: () => {
            let cexcept = el(Html.NE_SELECT).value;
            el(Html.NE_SELECT).disabled = true;
            el(Html.NE_SELECT2).style.display = "block";
            
            for (let i = 0; i < Common.playerNum; i++) {
                if (i == cexcept) continue;
                let p = Players.players[i];
                if (p.alive) {
                    el(Html.NE_SELECT2).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                }
            }
        },
    realAction : (actP) => {
        let cham = actP.chameleon;
        let ms = `<span class="curName" style="float:left;">[${actP.name}]</span><br>`;
        if (cham) ms += "A kaméleon csendben tegye a dolgát!<br>";
        ms += actP.role.nightSpeech;
        if (cham) ms += " (kaméleon)";
        el(Html.NE_SELECT).innerHTML = "";
        el(Html.NE_SELECT2).innerHTML = "";
        el(Html.NE_SELECT).style.display = "none";
        el(Html.NE_SELECT2).style.display = "none";
        if (!actP.alive) {
            ms += "<br>(csak mondd, mivel meghalt)";
            el(Html.NE_MESSAGE).innerHTML = ms;
            return;
        }
        if (actP.role == CityPlayers.WITCH) {
            ms += "<br>("+actP.potions+" főzet van nálad)";
        }
        el(Html.NE_MESSAGE).innerHTML = ms;
        
        switch (actP.role) {
            case CityPlayers.WITCH:
                el(Html.NE_SELECT).style.display = "block";
                el(Html.NE_SELECT).innerHTML += "<option value='0'>Főzés</option>";
                if (actP.potions > 0) {
                    el(Html.NE_SELECT).innerHTML += "<option value='1'>Gyógyítás</option><option value='2'>Mérgezés</option>";
                    el(Html.NE_SELECT2).style.display = "block";
                    el(Html.NE_SELECT2).style.visibility = "hidden";
                    for (let i = 0; i < Common.playerNum; i++) {
                        let p = Players.players[i];
                        if (p.alive) {
                            el(Html.NE_SELECT2).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                        }
                    }
                }
                
                el(Html.NE_SELECT).addEventListener("change", City.witchSelectHandle);
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
                el(Html.NE_SELECT).innerHTML += "<option value = '-1'>Senkit</option>";
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (p.alive && p != actP) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                break;

            case CityPlayers.PRIEST:
                el(Html.NE_SELECT).style.display = "block";
                el(Html.NE_SELECT2).style.display = "block";
                el(Html.NE_SELECT).innerHTML += "<option value='0'>Kérdezés</option>";                
                if (!actP.usedResurrect) {
                    el(Html.NE_SELECT).innerHTML += "<option value='1'>Feltámasztás</option>";
                }
                el(Html.NE_SELECT2).innerHTML += "<option value = '-1'>Senkit</option>";
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (!p.alive) {
                        el(Html.NE_SELECT2).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                break;
            
            case CityPlayers.NEIGHBOUR:
                el(Html.NE_SELECT).style.display = "block";
                for (let i = 0; i < Common.playerNum; i++) {
                    if (i == actP.preneigh) continue;
                    let p = Players.players[i];
                    if (p.alive && p != actP) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                break;
            
            case CityPlayers.CUPIDO:
                el(Html.NE_SELECT).style.display = "block";
                el(Html.NE_SELECT).innerHTML += "<option value = ''>Válassz jól!</option>"
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (p.alive) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                el(Html.NE_SELECT).addEventListener("change", City.cupidSelectHandle);
                break;
            
            case CityPlayers.HOOVER:
                if (City.hoovergun < 2) return;
                el(Html.NE_SELECT).style.display = "block";
                el(Html.NE_SELECT).style.disabled = false;
                el(Html.NE_SELECT).innerHTML += "<option value = '-1'>Senkit</option>";
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (p.alive && !checkItem(actP.gaveHoover, i) && p != actP) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                break;
            
            case CityPlayers.WATERGUN:
                if (City.hoovergun < 2) return;
                el(Html.NE_SELECT).style.display = "block";
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (p.alive && p != actP) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
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
                    player.potions++;
                }
                if (wact == 1) {
                    wtargetP.saved = true;
                    player.potions--;
                } 
                if (wact == 2) {
                    wtargetP.killed = true;
                    player.potions--;
                }
                el(Html.NE_SELECT).removeEventListener("change", City.witchSelectHandle);
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
                if (ptarget < 0) return;
                City.showRole(ptarget);
                console.log("Police action on ", ptarget);
                break;
            
            case CityPlayers.PRIEST:
                let pract = el(Html.NE_SELECT).value;
                let prtarget = el(Html.NE_SELECT2).value;
                if (pract == 0) {
                    if (prtarget < 0) return;
                    City.showRole(prtarget);
                } else {
                    if (prtarget < 0) return;
                    Players.players[prtarget].resurrected = true;
                    player.usedResurrect = true;
                }
                console.log("Priest action: ", pract, " on ", prtarget);
                break;
            
            case CityPlayers.NEIGHBOUR:
                let ntarget = el(Html.NE_SELECT).value;
                let neigh = Players.players[ntarget];
                if (neigh.role == CityPlayers.KILLER || neigh.role == CityPlayers.MAFFIA) {
                    player.killed = true;
                } else {
                    player.saved = true;
                    neigh.saved = true;
                }
                player.preneigh = ntarget;
                console.log("Neighbour action on ", ntarget);
                break;
            
            case CityPlayers.CUPIDO:
                let cup1 = el(Html.NE_SELECT).value;
                let cup2 = el(Html.NE_SELECT2).value;
                if (!checkItem(Players.players[cup1].lover, cup2)) Players.players[cup1].lover.push(cup2);
                if (!checkItem(Players.players[cup2].lover, cup1)) Players.players[cup2].lover.push(cup1);
                el(Html.NE_SELECT).removeEventListener("change", City.cupidSelectHandle);
                el(Html.NE_SELECT).disabled = false;
                console.log("Cupido action on " + cup1 + " & " + cup2);
                break;
            
            case CityPlayers.HOOVER:
                let htarget = el(Html.NE_SELECT).value;
                if (htarget < 0 || City.hoovergun < 2) return;
                let happyP = Players.players[htarget];
                happyP.getHoover = true;
                player.gaveHoover.push(htarget);
                if (!player.chameleon) {
                    City.chamhooverXtra[0] = htarget;
                } else {
                    if (htarget == City.chamhooverXtra[1]) {
                        happyP.killed = true;
                    }
                    if (htarget == City.chamhooverXtra[0]) {
                        City.chamhooverXtra[2] = htarget;
                    }
                }
                console.log("Hoover action on " + htarget, player.gaveHoover);
                break;
            
            case CityPlayers.WATERGUN:
                if (City.hoovergun < 2) return;
                let watarget = el(Html.NE_SELECT).value;
                let wetP = Players.players[watarget];
                if (wetP.getHoover) wetP.killed = true;
                if (!player.chameleon) {
                    City.chamhooverXtra[1] = watarget;
                } else {
                    if (watarget == City.chamhooverXtra[0]) {
                        wetP.killed = true;
                    }
                }
                console.log("Watergun action on " + watarget);
                break;

            default:
                break;
        }
        if (player.chameleon) {
            el(Html.NIGHT_EVENT).style.display = "none";
            el(Html.NIGHT_NEXT_BUTTON).style.display = "block";
            el(Html.NIGHT_NEXT_BUTTON).onclick = () => {
                el(Html.NIGHT_OVERLAY).style.display = "none";
                Games.stepPhase();
            }
        }
    },
    nightChameleon : function() {
        let chamel = getObj(Players.players, 'chameleon', true);
        City.realAction(chamel);
        el(Html.NE_BUTTON).onclick = () => {
            if (chamel.alive) City.nightActionResult(chamel);
            el(Html.NIGHT_EVENT).style.display = "none";
            el(Html.NIGHT_NEXT_BUTTON).style.display = "block";
                el(Html.NIGHT_NEXT_BUTTON).onclick = () => {
                    el(Html.NIGHT_OVERLAY).style.display = "none";
                    Games.stepPhase();
                }
            }
        console.log("Chameleon action.")
    },
    morningCalculations : function() {
        City.day++;
        let morningMS = `<p>${City.day}. nap</p>`;
        let noHungerTxt = true;
        let deathroll = [];
        let hooverroll = [];
        for (let i = 0; i < Common.playerNum; i++) {
            let p = Players.players[i];
            if (p.resurrected) {
                p.lover = [];
                p.killed = false;
                p.saved = false;
                p.getHoover = false; 
                p.resurrected = false;
                p.alive = true;
                el(Html.BOX + i).classList.remove("deadPlayer");
                morningMS += `<p><span class="resurname">${p.name}</span> visszatért a halálból!</p>`;
                if (p.role == CityPlayers.BAKER) City.hungerEnd = -1;
            } else if (p.killed && !p.saved) {
                deathroll.push(i);
            }
            if (City.hungerEnd > -1 && noHungerTxt) {
                let countdown = City.hungerEnd - City.day;
                if (countdown > 0) morningMS += `<p>${countdown} NAP MÚLVA VÉGETÉR A JÁTÉK!</p>`;
                noHungerTxt = false;
            }
            if (p.getHoover) {
                hooverroll.push(i);
                p.gotHoover = true;
            }
        };
        if (deathroll.length > 0) {
            for (const hulla of deathroll) {
                let hullovers = City.findLovers(hulla);
                for (const hl of hullovers) {
                    if (!checkItem(deathroll, hl) && Players.players[hl].alive) deathroll.push(hl);
                }
            }
            let hullak = [];
            for (const dead of deathroll) {
                Players.players[dead].alive = false;
                el(Html.BOX + dead).classList.add("deadPlayer");
                if (!checkItem(hullak, Players.players[dead].name)) hullak.push(Players.players[dead].name);
            }
            morningMS += `<p><span class="deadname">${smartList(hullak)}</span> meghalt az éjjel!</p>`;
        } else {
            if (City.day != City.hungerEnd) morningMS += "<p>Senki sem halt meg!</p>";
        }
        if (hooverroll.length > 0) {
            let hoovers = ["hiper-szuper", "csillivilli", "hápogó", "falra is mászó", "népdalokat éneklő", "idegtépően berregő", "hőre lágyuló", "jóravaló, takaros", "kellemetlen szagot árasztó", "nyugtalanítóan villogó", "szemtelen, mihaszna", "pöpecen önjáró", "peckesen lépkedő", "gúnyosan röfögő", "újszerűen kinéző", "alig használt", "fiatal, ambíciózus", "kissé bohó, de szerethető", "káros szenvedélyektől mentes", "kicsit sárga és savanyú", "szomorkásan zúgó", "minden kanyarban harsányan hahotázó", "öt percenként baljósan leálló", "szívszaggatóan köhécselő", "fanyar humorral megáldott", "komor füstöt árasztó"];
            for (const h of hooverroll) {
                let adj = rnd(hoovers);
                if (City.chamhooverXtra.length < 3) {
                    morningMS += `<p><span class="hoovername">${Players.players[h].name}</span> kapott egy ${adj} porszívót.</p>`;
                } else {
                    let adj2 = adj;
                    while (adj2 == adj) {
                        adj2 = rnd(hoovers);
                    }
                    morningMS += `<p><span class="hoovername">${Players.players[h].name}</span> kapott egy ${adj} és egy ${adj2} porszívót.</p>`;
                }
            }
        }
        el(Html.MORNING_MESSAGE).innerHTML = morningMS;
        City.checkDeathFollowup(deathroll);
        let end = City.checkCityEnd();
        el(Html.MORNING_NEXT_BUTTON).onclick = () => {
                el(Html.MORNING_OVERLAY).style.display = "none";
                Games.stepPhase();
            }
    },
    checkDeathFollowup : function(deathList) {
        let followMS = "";
        for (const dl of deathList) {
            let dp = Players.players[dl];
            switch (dp.role) {
                case CityPlayers.BAKER:
                    let otherBaker = false;
                    for (let i = 0; i < Common.playerNum; i++) {
                        let p = Players.players[i];
                        if (p.alive && p.role == CityPlayers.BAKER) {
                            otherBaker = true;
                        };
                    }
                    if (!otherBaker) {
                        City.hungerEnd = City.day + 3;
                        followMS = "3 NAP MÚLVA MINDENKI ÉHEN HAL!"
                    }
                    break;
                
                case CityPlayers.HOOVER:
                    let otherHoover = false;
                    for (let i = 0; i < Common.playerNum; i++) {
                        let p = Players.players[i];
                        if (p.alive && p.role == CityPlayers.HOOVER) otherHoover = true;
                    }
                    if (otherHoover == false) {
                        City.hoovergun--;
                        for (let j = 0; j < Common.playerNum; j++) {
                            let p = Players.players[j];
                            if (p.alive && p.role == CityPlayers.WATERGUN) {
                                followMS = "A Vízipisztolyos gyerek felnőtt.";
                                p.winalone = false;
                            };
                        }
                    }
                    break;
                
                case CityPlayers.WATERGUN:
                    let otherWater = false;
                    for (let i = 0; i < Common.playerNum; i++) {
                        let p = Players.players[i];
                        if (p.alive && p.role == CityPlayers.WATERGUN) otherWater = true;
                    }
                    if (otherWater == false) {
                        City.hoovergun--;
                        for (let j = 0; j < Common.playerNum; j++) {
                            let p = Players.players[j];
                            if (p.alive && p.role == CityPlayers.HOOVER) {
                                followMS = "A Porszívóügynök más hivatást választott.";
                                p.winalone = false;
                            };
                        }
                    }
                    break;
                
                default:
                    break;
            }
        }
        if (followMS.length > 0) {
            City.displayImportantMessage(followMS);
        }
    },
    displayImportantMessage : function(ms) {
        console.log("MESSAGE: ", ms, Games.phase)
        if (Games.phase == States.MORNING) {
            el(Html.GAME_END_MORNING).innerHTML = ms;
        } else {
            el(Html.DAY_OVERLAY).style.display="block";
            el(Html.GAME_END_DAY).innerHTML = ms;
            el(Html.DAY_NEXT_BUTTON).onclick = () => {
                el(Html.DAY_OVERLAY).style.display = "none";
            }    
        }
    },
    checkCityEnd : function (winners=[]) {
        let end = winners.length > 0;
        let winMS = "<p>VÉGET ÉRT A JÁTÉK!</p>";
        //hungerend
        if (City.day == City.hungerEnd) {
            for (let i = 0; i < Common.playerNum; i++) {
                Players.players[i].alive = false;
                el(Html.BOX + i).classList.add("deadPlayer");
            }
        };
        let living = getObjs(Players.players, "alive", true);
        //overkill
        if (living.length < 1) {
            end = true;
            winMS += "<p>Mindenki veszített!</p>";
            City.displayImportantMessage(winMS);
            return end;
        }
        //Clown
        if (winners.length > 0) {
            let winame = Players.players[winners[0]].name + " (Bohóc";
            if (Players.players[winners[0]].chameleon) winame += " - kaméleon";
            winMS += `<p id="winnersList">Győzött ${winame})!</p>`;
            City.displayImportantMessage(winMS);
            return end;
        }
        let levils = getObjs(living, "evil", true);
        let lgoods = getObjs(living, "evil", false);
        //evil win
        if (levils.length >= lgoods.length) {
            end = true;
            for (let i = 0; i < Common.playerNum; i++) {
                let p = Players.players[i];
                if (p.evil && p.alive && !p.winalone) {
                    let wn = p.name + " (" + p.role.nev;
                    let wn2 = p.chameleon ? " - kaméleon)" : ")";
                    wn = wn + wn2;
                    winners.push(wn);
                }
            }
        }
        //goodwin
        if (levils.length < 1) {
            end = true;
            for (let i = 0; i < Common.playerNum; i++) {
                let p = Players.players[i];
                if (!p.evil && p.alive && !p.winalone) {
                    let wn = p.name + " (" + p.role.nev;
                    let wn2 = p.chameleon ? " - kaméleon)" : ")";
                    wn = wn + wn2;
                    winners.push(wn);
                }
            }
        }
        //Forecaster
        for (let i = 0; i < Common.playerNum; i++) {
            let p = Players.players[i];
            if (p.alive && p.role == CityPlayers.FORECASTER && p.forecast == City.day) {
                let wn = p.name + " (" + p.role.nev;
                let wn2 = p.chameleon ? " - kaméleon)" : ")";
                wn = wn + wn2;
                winners.push(wn);
                end = true;
            }
        }
        
        //Hoover
        if (City.hoovergun > 1) {
            let alives = [];
            for (let i = 0; i < Common.playerNum; i++) {
                if (Players.players[i].alive) alives.push(i);
            }
            for (let i = 0; i < Common.playerNum; i++) {
                let p = Players.players[i];
                if (p.alive && p.role == CityPlayers.HOOVER) {
                    let hw = true;
                    delItem(alives, i);
                    for (let j = 0; j < alives.length; j++) {
                        let val = alives[j];
                        if (!checkItem(p.gaveHoover, val)) hw = false;
                    }
                    if (hw) {
                        let wn = p.name + " (" + p.role.nev;
                        let wn2 = p.chameleon ? " - kaméleon)" : ")";
                        wn = wn + wn2;
                        winners.push(wn);
                        end = true;
                    }
                    console.log("HOOVERWIN: ", alives, p.gaveHoover, hw);
                }
            }
        }
        
            
        if (end) {
            winMS += `<p id="winnersList">Győzött ${smartList(winners, winners.length > 2)}!</p>`;
            City.displayImportantMessage(winMS);
        }
        return end;
    }
};