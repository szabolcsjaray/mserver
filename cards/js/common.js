// common stuff
export const MAX_PLAYER_NUM = 10;
export const NO_LAST_POINT = 100000;

export const points = [40, 40, 40, 40, 40, 40, 40, 40, 40, 40];
export const lastPoints = [
    NO_LAST_POINT, NO_LAST_POINT, NO_LAST_POINT, NO_LAST_POINT, NO_LAST_POINT,
    NO_LAST_POINT, NO_LAST_POINT, NO_LAST_POINT, NO_LAST_POINT, NO_LAST_POINT
];
export const Common = {
    playerNum : 0,
    basket : 0,
    addPlayerModal : null
};

export let playerNum = 0;

export var basket = 0;
export let addPlayerModal;

export function el(id) {
    let element = document.getElementById(id);
    if (element == null) {
        throw new Error("Element with id: " + id + "could not be found!");
    }
    return element;
}

export function isVisible(id) {
    let element = el(id);
    return !(element.style.display == undefined 
        || element.style.display == null
        || element.style.display == "none");
}

//Gergő's basic functions - export if needed

let rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

let shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

let capital = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1);

function nevelos(str, nagy = false) {
    let ne = nagy ? "A" : "a";
    ne += (/[öüóeuioőúaéáűí]/i.test(str.charAt(0))) ? "z " : " ";
    return ne + str;
}

let tized = (v) => Math.round(v * 10) / 10;

export let checkItem = (arr, it) => arr.indexOf(it) > -1;

export let checkItemDeep = (arr, prop, it) => arr.findIndex((a) => a[prop] == it) > -1;

let delItem = (arr, it) => {
    for (let n = 0; n < arr.length; n++) {
        if (arr[n] == it) {
            arr.splice(n, 1);
            n--;
        }
    }
}

export let delItemDeep = (arr, prop, it) => {
    for (let n = 0; n < arr.length; n++) {
        if (arr[n][prop] == it) {
            arr.splice(n, 1);
            n--;
        }
    }
}

export let getObj = (arr, prop, it) => {
    let r = arr.findIndex((a) => a[prop] == it);
    if (r > -1) {
        return arr[r];
    } else {
        return false;
    }
};

export let getObjs = (arr, prop, it) => arr.filter((a) => a[prop] == it);

export let getObjsC = (arr, prop, cond) => arr.filter((a) => eval(a[prop] + cond));

let checkListItem = (arr, prop, it) => {
    let r = false;
    for (const a of arr) {
        if (checkItem(a[prop], it)) r = true;
    }
    return r;
}

let getListItems = (arr, prop, it) => {
    let r = [];
    for (const a of arr) {
        if (checkItem(a[prop], it)) r.push(a);
    }
    return r;
}
