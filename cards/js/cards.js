function init() {
  Players.readStoredPlayers();
  el(Html.PLAY_BUTTON).onclick = gameMode;
  el(Html.TURN_BUTTON).onclick = countingMode;
  el("player").onclick = addPlayer;
  el("newName").onchange = doAddPlayer;
  el("newGame").onclick = startNewGame;
  Games.fn.initButtons();
  
  fillBoxes();
  pointsReset();
  colorPlayerBlocks();
  addPlayerModal = document.getElementById('modal');
  Players.readLastPlayers();

  Games.fn.changeTo(Games.fn.LORUM);
  Games.fn.setPhase(States.PLAY);
}

// New game -----------------------------------------------

function startNewGame() {
  if (confirm("Új játékot indítész (pontok visszaállítása)?")) {
    doNewGame();
  }
}

function doNewGame() {
  pointsReset();
  Games.fn.setPhase(States.PLAY);
}

// Players --------------------------------

function addPlayer() {
  if (playerNum <10) {
    openAddPlayerModal();
    el("newName").focus();
  }
}

function playerOnBoard(name) {
  for(let i = 0; i< playerNum; i++) {
    if (el("name"+i).innerHTML == name) {
      return true;
    }
  }
  return false;
}

function doAddPlayer(newName) {
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
    el("name" + playerNum).innerHTML = newName;
    el("newName").value = "";
    playerNum++;
    colorPlayerBlocks();
}

function setName(i, name) {
  el("name"+i).innerHTML = name;
}

function playerRemove(evt) {
  let id = parseInt(evt.target.id["playerRemove".length]);
  if (id >= playerNum) return;
  if (confirm("A játékos " + el("name"+id).innerText + " biztosan kiszáll?")) {
    points.splice(id, 1);
    points.push(0);
    for(let i = id; i < playerNum+1; i++) {
      let nextI = i+1;
      if (nextI >= 9) {
        el("name9").innerHTML = "---";
      } else {
        el("name" + i).innerHTML = el("name" + nextI).innerHTML;
      }
      addPoint(i, 0);
    }
    playerNum--;
    colorPlayerBlocks();
  }
}

// Points --------------------------------------------

function pointsReset() {
    basket = 0;
    addBasket(0);
    for(let i = 0; i< MAX_PLAYER_NUM; i++) {
      points[i] = 40;
    }
    refreshPoints();
}

function refreshPoints() {
    for(let i = 0; i < MAX_PLAYER_NUM; i++) {
        el("pont"+i).innerHTML = points[i];
    }
}

function addPoint(i, point) {
  points[i] += point;
  el("pont"+i).innerHTML = points[i];
}  

function multiDrop(index, value) {
  el(Html.DROP_NUM_INPUT + "_" + index).value = value;
}  

function addBasket(num) {
  basket = basket + parseInt(num);
  el("pont").innerHTML = basket;
}  

function doMinus1(evt){
  let id = evt.target.id[7];
  if (id >= playerNum) return;
  if (points[id] == 0) return;
  playSound("drop");
  addPoint(id, -1);
  addBasket(1);
}

function doMinusM(evt){
  let id = evt.target.id[7];
  if (id >= playerNum) return;
  let factor = (Engine.fn.getValue(RuleAction.DROP_DECREASE_POINT) ? -1 : 1);
  if (!Engine.fn.getValue(RuleAction.ALLOW_MINUS_AT_DROP_NUM) && el(Html.DROP_NUM_INPUT + "_"+id).value < 0) {
    alert("Ebben a játékban nem lehet mínusz értéket 'bedobni'.");
    return;
  }
  playSound("drops");
  addPoint(id, factor * el(Html.DROP_NUM_INPUT + "_"+id).value);
  if (isVisible(Html.BASKET)) {
    addBasket(el(Html.DROP_NUM_INPUT + "_"+id).value);
  }
  el(Html.DROP_NUM_INPUT + "_"+id).value = 0;
}        

function doUp(evt){
  let id = evt.target.id[3];  
  if (id >= playerNum) return;
  let val = el(Html.DROP_NUM_INPUT + "_" + id).value;
  val++;
  el(Html.DROP_NUM_INPUT + "_"+id).value = val;
}

function doDown(evt){
  let id = evt.target.id[5];
  if (id >= playerNum) return;
  let val = el(Html.DROP_NUM_INPUT + "_" + id).value;
  val--;
  if (!Engine.fn.getValue(RuleAction.ALLOW_MINUS_AT_DROP_NUM)) {
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
  if (id >= playerNum) return;
  el("dropNum_" + id).value = "";
}        


function winnerSet(evt) {
  if (Games.fn.phase != States.SELECT_WINNER) {
    return;
  }
  let id = evt.target.id[4];
  if (id > playerNum) return;
  let multi = 1;
  playSound('ding');
  addPoint(id, basket * multi);
  basket = 0;
  addBasket(0);
  Games.fn.stepPhase();
}

// Player boxes ----------------------------------------

function fillBoxes() {
  for(let i = 0; i < MAX_PLAYER_NUM; i++) {
      let html = "        <div class=\"name\" id=\"name"+i+"\"></div>"
        + "<div class=\"playerData\">"
        + "<div class=\"point\" id=\"pont"+i+"\">40</div>"
        + "<button class=\"minus1\" style=\"display: none;\" id=\"minus1_"+i+"\" > -1 </button>" 
        + "<button class=\"minusM\" style=\"display: inline-block;\" id=\"down_"+i+"\"> &darr; </button>"
        + "<input class=\"dropNum\" type=\"number\" min=\"-7\" style=\"display: inline-block;\" id=\"dropNum_"+i+"\">"
        + "<button class=\"minusM\" style=\"display: inline-block;\" id=\"up_"+i+"\"> &uarr; </button>"
        + "<button class=\"minusM\" style=\"display: inline-block;\" id=\"minusM_"+i+"\">" 
            + "<img src=\"img/Curved_Arrow.svg\" class=\"dropImg\" id=\"minImM_"+i+"\"></button>"
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

      multiDrop(i, 0);
      setName(i, "---");
  }
}



function colorPlayerBlocks() {
  for(let i = 0; i < MAX_PLAYER_NUM; i++) {
    if (i < playerNum) {
      el("box" + i).style.backgroundColor = "";
    } else {
      el("box" + i).style.backgroundColor = "grey";
    }
  }
}

function hideElements(id) {
  for(let i = 0; i < MAX_PLAYER_NUM; i++) {
    el(id+"_"+i).style.display = "none";
  }
}

function showElements(id, showStyle) {
  for(let i = 0; i < MAX_PLAYER_NUM; i++) {
    el(id+"_"+i).style.display = showStyle;
  }
}

// Game modes ----------------------------------------------------

function gameMode() {
    if (Games.fn.phase == States.PLAY){
      return;
    }
    Games.fn.stepPhase();
}

function countingMode() {
  Games.fn.setPhase(States.TURN);
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

function makeOption(id, str) {
  const option = document.createElement("option");
  option.value = id;
  option.textContent = str;
  return option;
}

function message(m) {
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
  el(Html.QUIT_ADD_PLAYER_BUTTON).onclick = function(){addPlayerModal.style.display = 'none'};
  const select = el("selectName");
  el("selectNameP").style.display = "inline";
  select.onselect = newPlayerSelected;
  select.options.length = 0;
  for(let i = 0; i < Players.players.length; i++) {
      select.appendChild(makeOption(i, Players.players[i].name));
  }
  select.appendChild(makeOption(-1, "- Új név hozzáadása -"));
  
  addPlayerModal.style.display = 'flex'; // Show overlay and center content
}

function closeAddPlayerModal() {
  addPlayerModal.style.display = 'none';
}

// ------------------------------------------------------------------------

window.onload = init;