import { Common, el, getObj, getObjs, getObjsC, delItemDeep, checkItem, checkItemDeep, checkListItem, rnd } from "../common.js";
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
        //TODO: ide ehelyett kell egy overall deathcheck
        let lovers = Players.players[id].lover;
        console.log("LOVERS: ", lovers, lovers.length);
        if (lovers.length > 0){
            el(Html.DAY_OVERLAY).style.display="block";
            for (let i = 0; i < lovers.length; i++) {
                const lover = lovers[i];
                Players.players[lover].alive = false;
                if (i == 0) {
                    el(Html.HUNG_LOVER_NAME).innerHTML = Players.players[lover].name;
                } else {
                    el(Html.HUNG_LOVER_NAME).innerHTML += " és " + Players.players[lover].name;
                }
                el(Html.BOX + lover).classList.add("deadPlayer");
            }
            el(Html.DAY_NEXT_BUTTON).onclick = () => {
               el(Html.DAY_OVERLAY).style.display = "none";
            }
        }
        
        el(Html.BOX + id).classList.add("deadPlayer");
        
        //TODO other deaths + check end of game (also forecast), show winner
        Games.stepPhase();
    },
    nightMurder : function() {
        console.log("Night murder phase");
        Players.players.map((p) => p.lover = []);
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
            let sid = Number(el(Html.NE_SELECT).value);
            if (sid < 0) { City.nightActions();} 
            else {
                let hulla = Players.players[sid];
                hulla.killed = true;
                console.log('hulla: ', hulla);
                City.nightActions();
            }
        }
    },
    nightActions : function() {
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
        let ms = cham ? "A kaméleon tegye a dolgát!<br>" : "";
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
                el(Html.NE_SELECT).style.display = "block";
                el(Html.NE_SELECT).innerHTML += "<option value = '-1'>Senkit</option>"
                for (let i = 0; i < Common.playerNum; i++) {
                    let p = Players.players[i];
                    if (p.alive && !p.gotHoover && p != actP) {
                        el(Html.NE_SELECT).innerHTML += "<option value='" + i + "'>" + p.name + "</option>";
                    }
                }
                break;
            
            case CityPlayers.WATERGUN:
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
                City.showRole(ptarget);
                console.log("Police action on ", ptarget);
                break;
            
            case CityPlayers.PRIEST:
                let pract = el(Html.NE_SELECT).value;
                let prtarget = el(Html.NE_SELECT2).value;
                if (pract == 0) {
                    City.showRole(prtarget);
                } else {
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
                
                Players.players.map((pp) => {
                    console.log(pp.name + ": " + pp.lover);
                });
                
                el(Html.NE_SELECT).removeEventListener("change", City.cupidSelectHandle);
                el(Html.NE_SELECT).disabled = false;
                console.log("Cupido action on " + cup1 + " & " + cup2);
                break;
            
            case CityPlayers.HOOVER:
                let htarget = el(Html.NE_SELECT).value;
                if (htarget < 0) return;
                let happyP = Players.players[htarget];
                happyP.gotHoover = true;
                break;
            
            case CityPlayers.WATERGUN:
                let watarget = el(Html.NE_SELECT).value;
                let wetP = Players.players[watarget];
                wetP.getWater = true;
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
            City.nightActionResult(chamel);
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
        //TODO: all calculations: killed, saved, resurrected, cupido, porszívó
    }
};