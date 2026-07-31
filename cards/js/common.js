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
    nasket : 0,
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
