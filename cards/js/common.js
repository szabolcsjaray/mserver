// common stuff

const GAME = 0;
const COUNTING = 1;
const WINNER = 2;
const NONE = "none";
const VISIBLE = "inline-block";
const MAX_PLAYER_NUM = 10;

var mode = GAME;
var points = [40, 40, 40, 40, 40, 40, 40, 40, 40, 40];
var playerNum = 0;

var basket = 0;
var addPlayerModal;

function el(id) {
    return document.getElementById(id);
}

function isVisible(id) {
    let element = el(id);
    return !(element.style.display == undefined 
        || element.style.display == null
        || element.style.display == "none");
}
