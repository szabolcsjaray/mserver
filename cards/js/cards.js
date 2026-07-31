import {Html} from './html.js';
import {Games} from './games.js';
import { MAX_PLAYER_NUM, NO_LAST_POINT, points, lastPoints, Common, el, isVisible } from './common.js';
import {Players} from './player.js';
import { City } from './city/city.js';
import { States } from './states.js';
import { Engine } from './engine.js';
import { RuleAction } from './rules.js';

function init() {
  Players.readStoredPlayers();
  el(Html.PLAY_BUTTON).onclick = gameMode;
  el(Html.TURN_BUTTON).onclick = countingMode;
  el("player").onclick = addPlayer;
  el("newName").onchange = doAddPlayer;
  el("newGame").onclick = startNewGame;
  el(Html.NEXT_BUTTON).onclick = City.nextPhase;
  el(Html.ROLES_SELECTED_BUTTON).onclick = City.nextPhase;
  Games.initButtons();
  
  fillBoxes();
  pointsReset();
  colorPlayerBlocks();
  Common.addPlayerModal = document.getElementById('modal');
  Players.readLastPlayers();

  Games.changeTo(Games.LORUM);
  Games.setPhase(States.PLAY);
}

// New game -----------------------------------------------

function startNewGame() {
  if (confirm("Új játékot indítész (pontok visszaállítása)?")) {
    doNewGame();
  }
}

function doNewGame() {
  pointsReset();
  Games.setPhase(States.PLAY);
}

// Players --------------------------------

function addPlayer() {
  if (Common.playerNum <10) {
    openAddPlayerModal();
    el("newName").focus();
  }
}

function playerOnBoard(name) {
  for(let i = 0; i< Common.playerNum; i++) {
    if (el("name"+i).innerHTML == name) {
      return true;
    }
  }
  return false;
}

export function doAddPlayer(newName) {
    if (el("newNameP").style.display == "inline") {
      newName = el("newName").value;
      if (newName.length == 0) {
        alert("A név nem lehet üres!");
        return;
      }
    }
    if (playerOnBoard(newName)) {
      return;
    }
    Players.addPlayer(newName);
    Players.addLastPlayer(newName);
    el("name" + Common.playerNum).innerHTML = newName;
    el("newName").value = "";
    Common.playerNum++;
    colorPlayerBlocks();
}

function setName(i, name) {
  el("name"+i).innerHTML = name;
}

function playerRemove(evt) {
  let id = parseInt(evt.target.id["playerRemove".length]);
  if (id >= Common.playerNum) return;
  if (confirm("A játékos " + el("name"+id).innerText + " biztosan kiszáll?")) {
    points.splice(id, 1);
    points.push(0);
    for(let i = id; i < Common.playerNum+1; i++) {
      let nextI = i+1;
      if (nextI >= 9) {
        el("name9").innerHTML = "---";
      } else {
        el("name" + i).innerHTML = el("name" + nextI).innerHTML;
      }
      addPoint(i, 0);
    }
    Common.playerNum--;
    colorPlayerBlocks();
  }
}

// Points --------------------------------------------

function pointsReset() {
    Common.basket = 0;
    addBasket(0);
    for(let i = 0; i< MAX_PLAYER_NUM; i++) {
      points[i] = 40;
    }
    refreshPoints();
}

export function refreshPoints() {
    for(let i = 0; i < MAX_PLAYER_NUM; i++) {
        el("pont"+i).innerHTML = points[i];
    }
}

export function addPoint(i, point) {
  points[i] += point;
  el("pont"+i).innerHTML = "" + points[i] 
    + (lastPoints[i] != NO_LAST_POINT ? " (" + lastPoints[i] + ")" : "");
}  

function multiDrop(index, value) {
  el(Html.DROP_NUM_INPUT + "_" + index).value = value;
}  

function addBasket(num) {
  Common.basket = Common.basket + parseInt(num);
  el("pont").innerHTML = Common.basket;
}  

function doMinus1(evt){
  let id = evt.target.id[7];
  if (id >= Common.playerNum) return;
  if (points[id] == 0) return;
  playSound("drop");
  addPoint(id, -1);
  addBasket(1);
}

function doMinusM(evt){
  let id = evt.target.id[7];
  if (id >= Common.playerNum) return;
  let factor = (Engine.getValue(RuleAction.DROP_DECREASE_POINT) ? -1 : 1);
  if (!Engine.getValue(RuleAction.ALLOW_MINUS_AT_DROP_NUM) && el(Html.DROP_NUM_INPUT + "_"+id).value < 0) {
    alert("Ebben a játékban nem lehet mínusz értéket 'bedobni'.");
    return;
  }
  playSound("drops");
  lastPoints[id] = el(Html.DROP_NUM_INPUT + "_"+id).value;
  addPoint(id, factor * el(Html.DROP_NUM_INPUT + "_"+id).value);
  if (isVisible(Html.BASKET)) {
    addBasket(el(Html.DROP_NUM_INPUT + "_"+id).value);
  }
  el(Html.DROP_NUM_INPUT + "_"+id).value = 0;
}        

function doUp(evt){
  let id = evt.target.id[3];  
  if (id >= Common.playerNum) return;
  let val = el(Html.DROP_NUM_INPUT + "_" + id).value;
  val++;
  el(Html.DROP_NUM_INPUT + "_"+id).value = val;
}

function doDown(evt){
  let id = evt.target.id[5];
  if (id >= Common.playerNum) return;
  let val = el(Html.DROP_NUM_INPUT + "_" + id).value;
  val--;
  if (!Engine.getValue(RuleAction.ALLOW_MINUS_AT_DROP_NUM)) {
    val = 0;
  } else {
    if (val < -7) {
      val = -7;
    }
  }
  el(Html.DROP_NUM_INPUT + "_"+id).value = val;
}

function zeroField(evt){
  let id = evt.target.id[8];
  if (id >= Common.playerNum) return;
  el("dropNum_" + id).value = "";
}        


function winnerSet(evt) {
  if (Games.phase != States.SELECT_WINNER) {
    return;
  }
  let id = evt.target.id[4];
  if (id > Common.playerNum) return;
  let multi = 1;
  playSound('ding');
  addPoint(id, Common.basket * multi);
  Common.basket = 0;
  addBasket(0);
  Games.stepPhase();
}

// Player boxes ----------------------------------------

function fillBoxes() {
  for(let i = 0; i < MAX_PLAYER_NUM; i++) {
      let html = "        <div class=\"name\" id=\"name"+i+"\"></div>"
        + "<img class=\"role\" src=\"img/severity-unknown-svgrepo-com.svg\" id=\"roleIcon_"+i+"\">"
        + "<div class=\"playerData\">"
        + "<div class=\"point\" id=\"pont"+i+"\">40</div>"
        + "<button class=\"minus1 playerOp\" style=\"display: none;\" id=\"minus1_"+i+"\" > -1 </button>" 
        + "<button class=\"minusM playerOp\" style=\"display: inline-block;\" id=\"down_"+i+"\"> &darr; </button>"
        + "<input class=\"dropNum playerOp\" type=\"number\" min=\"-7\" style=\"display: inline-block;\" id=\"dropNum_"+i+"\">"
        + "<button class=\"minusM playerOp\" style=\"display: inline-block;\" id=\"up_"+i+"\"> &uarr; </button>"
        + "<button class=\"minusM playerOp\" style=\"display: inline-block;\" id=\"minusM_"+i+"\">" 
        + "<button class=\"showPlayer playerOp\" id=\"showPlayer_"+i+"\">" 
            + "Szerepe </button>"
        + "</div>"
        + "<button class=\"menet remove\" id=\"playerRemove"+i+"\"> X </button>";
      el("box"+i).innerHTML = html;
      el("minus1_"+i).onclick = doMinus1;
      el("minusM_"+i).onclick = doMinusM;
      el("up_"+i).onclick = doUp;
      el("down_"+i).onclick = doDown;
      el("name"+i).onclick = winnerSet;
      el("playerRemove"+i).onclick = playerRemove;
      el("dropNum_"+i).onfocus = zeroField;
      el(Html.SHOW_PLAYER_CLASS + "_" + i).onclick = City.showPlayer;

      multiDrop(i, 0);
      setName(i, "---");
  }
}

function colorPlayerBlocks() {
  for(let i = 0; i < MAX_PLAYER_NUM; i++) {
    if (i < Common.playerNum) {
      el("box" + i).style.backgroundColor = "";
      el("box" + i).classList.remove("empty");
    } else {
      el("box" + i).style.backgroundColor = "grey";
      el("box" + i).classList.add("empty");
    }
  }
}

export function hideClass(classId) {
  let els = document.getElementsByClassName(classId);
  for(let i = 0; i < els.length; i++) {
    els[i].style.display = 'none';
  }
}

export function showClass(classId, mode  = 'block') {
  let els = document.getElementsByClassName(classId);
  for(let i = 0; i < els.length; i++) {
    els[i].style.display = mode;
  }
}


export function hideElements(id) {
  for(let i = 0; i < MAX_PLAYER_NUM; i++) {
    el(id+"_"+i).style.display = "none";
  }
}

export function showElements(id, showStyle) {
  for(let i = 0; i < Common.playerNum; i++) {
    el(id+"_"+i).style.display = showStyle;
  }
}

// Game modes ----------------------------------------------------

function gameMode() {
    if (Games.phase == States.PLAY){
      return;
    }
    Games.stepPhase();
}

function countingMode() {
  Games.setPhase(States.TURN);
}

// Utils -----------------------------------------------------------------

function playSound(sound) {
  let audio = new Audio("snd/"+sound+'.mp3');
  audio.play();
}

function setClassVisibility(className, visbility) {
    const elements = document.getElementsByClassName(className);
    for (let el of elements) {
        el.style.display = visbility;
    }
}

export function makeOption(id, str) {
  const option = document.createElement("option");
  option.value = id;
  option.textContent = str;
  return option;
}

export function message(m) {
  el("message").innerHTML = m;
}

// Player modal ------------------------------------------------

function newPlayerSelected() {
  const select = el("selectName");
  if (select.value == -1) {
    el("addButton").textContent = "Hozzáad";
    el("newNameP").style.display = "inline";
    el("selectNameP").style.display = "none";
    el("addButton").onclick = closePlayerModalAnddoAddPlayer;
  } else {
    closeAddPlayerModal();
    doAddPlayer(Players.players[select.value].name);
  }
}

function closePlayerModalAnddoAddPlayer() {
  closeAddPlayerModal();
  doAddPlayer();
}

function openAddPlayerModal() {
  el("newNameP").style.display = "none";
  el("addButton").textContent = "Választ";
  el("addButton").onclick = newPlayerSelected;
  el(Html.QUIT_ADD_PLAYER_BUTTON).onclick = function(){Common.addPlayerModal.style.display = 'none'};
  const select = el("selectName");
  el("selectNameP").style.display = "inline";
  select.onselect = newPlayerSelected;
  select.options.length = 0;
  for(let i = 0; i < Players.players.length; i++) {
      select.appendChild(makeOption(i, Players.players[i].name));
  }
  select.appendChild(makeOption(-1, "- Új név hozzáadása -"));
  
  Common.addPlayerModal.style.display = 'flex'; // Show overlay and center content
}

function closeAddPlayerModal() {
  Common.addPlayerModal.style.display = 'none';
}

// ------------------------------------------------------------------------

window.onload = init;