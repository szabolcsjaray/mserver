import { el }from './common.js';
import { States } from './states.js';
import { RuleAction } from './rules.js';
import { Html } from './html.js';
import { City } from './city/city.js';
import { Engine } from './engine.js';
import { makeOption } from './cards.js';

export const Games = {
    Game : class {
        constructor(name, states, rules, startPoint, endPoint, loopPhase = null) {
            this.name = name;
            this.states = states;
            this.rules = rules;
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.loopPhase = loopPhase;
        }
    },
    // games
    JAGO : 0,
    LORUM : 1,
    CITY : 2,
    // runnng game and phase
    running : 0, // actual running game index
    phase : 0, // actual phase of the game
    showChangeTheGame() {
        console.log("Game.change");
        el(Html.GAME_CHANGE_MODAL).style.display = "flex";
        el(Html.QUIT_SELECT_GAME_BUTTON).onclick = function(){
            el(Html.GAME_CHANGE_MODAL).style.display = "none";
        };
        el(Html.SELECT_GAME_BUTTON).onclick = Games.changeTheGame;
        let select = el(Html.SELECT_GAME);
        select.options.length = 0;
        for(let i = 0; i < Games.cgames.length; i++) {
            select.appendChild(makeOption(i, Games.cgames[i].name));
        }
    },
    changeTo(newGame) {
        el(Html.GAME_NAME_DIV).innerHTML = Games.cgames[newGame].name;
        Games.phase = States.CLOSING;
        Engine.runPhase();

        Games.running = newGame;
        Games.phase = States.INITIAL;
        Engine.runPhase();

        Games.stepPhase();
    },
    changeTheGame() {
        if (el(Html.SELECT_GAME).value != Games.running) {
            Games.changeTo(el(Html.SELECT_GAME).value);
        }
        el(Html.GAME_CHANGE_MODAL).style.display = "none";
    },
    initButtons() {
        el(Html.CHANGE_GAME_BUTTON).onclick = Games.showChangeTheGame;
    },
    setPhase(newPhase) {
        Games.phase = newPhase;
        Engine.runPhase();
        if (newPhase == States.TURN) {
            el("counting").style.backgroundColor = "rgb(35, 37, 181)";
            el("game1").style.backgroundColor = "gray";
        } else if (newPhase == States.PLAY) {
            el("game1").style.backgroundColor = "rgb(35, 37, 181)";
            el("counting").style.backgroundColor = "gray";
        } else if (newPhase == States.SELECT_WINNER) {
            el("game1").style.backgroundColor = "yellow";
        }
    },
    stepPhase() {
        let game = Games.cgames[Games.running];
        let i = game.states.indexOf(Games.phase);
        i++;
        if (i >= game.states.length || i == -1 ) {
            if (game.loopPhase != null 
                && game.states.indexOf(game.loopPhase) != -1 
                && i != -1) {
                i = game.states.indexOf(game.loopPhase);
            } else {
                i = 0;
            }
        }
        Games.setPhase(game.states[i]);
    }
};

Games.cgames = [
    new Games.Game(
        "Jágó",
        [States.PLAY, States.TURN],
        [
            [States.INITIAL, RuleAction.HIDE_CLASS, Html.PLAYER_OP_CLASS],
            [States.INITIAL, RuleAction.HIDE, Html.BASKET],
            [States.INITIAL, RuleAction.HIDE, Html.NEXT_BUTTON],
            [States.INITIAL, RuleAction.SHOW_INLINE_BLOCK, Html.PLAY_BUTTON],
            [States.INITIAL, RuleAction.SHOW_INLINE_BLOCK, Html.TURN_BUTTON],
            [States.INITIAL, RuleAction.SHOW_CLASS, Html.POINT_CLASS],

            [States.TURN, RuleAction.MESSAGE, "Rendezzétek a pontokat és katt/nyom az JÁTÉK-ra!"],
            [States.TURN, RuleAction.SHOW_ALL, Html.DOWN_BUTTON],
            [States.TURN, RuleAction.SHOW_ALL, Html.UP_BUTTON],
            [States.TURN, RuleAction.SHOW_ALL, Html.DROP_NUM_INPUT],
            [States.TURN, RuleAction.SHOW_ALL, Html.MINUS_DROP_NUM_BUTTON],

            [States.PLAY, RuleAction.MESSAGE, "Ha végetért a kör, katt/nyom az ELSZÁMOLÁS-ra!"],
            [States.PLAY, RuleAction.HIDE_ALL, Html.DOWN_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.UP_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.DROP_NUM_INPUT],
            [States.PLAY, RuleAction.HIDE_ALL, Html.MINUS_DROP_NUM_BUTTON],

            [States.ALL, RuleAction.ALLOW_MINUS_AT_DROP_NUM, true],
            [States.ALL, RuleAction.DROP_DECREASE_POINT, false]
        ],
        0,
        100
    ),
    new Games.Game(
        "Lórum",
        [States.PLAY, States.TURN, States.SELECT_WINNER],
        [
            [States.INITIAL, RuleAction.HIDE_CLASS, Html.PLAYER_OP_CLASS],
            [States.INITIAL, RuleAction.SHOW_INLINE_BLOCK, Html.BASKET],
            [States.INITIAL, RuleAction.HIDE, Html.NEXT_BUTTON],
            [States.CLOSING, RuleAction.HIDE, Html.BASKET],
            [States.INITIAL, RuleAction.SHOW_INLINE_BLOCK, Html.PLAY_BUTTON],
            [States.INITIAL, RuleAction.SHOW_INLINE_BLOCK, Html.TURN_BUTTON],
            [States.INITIAL, RuleAction.SHOW_CLASS, Html.POINT_CLASS],

            [States.PLAY, RuleAction.MESSAGE, "Dobjatok be egyet, ha kell!"],
            [States.PLAY, RuleAction.SHOW_ALL, Html.MINUS_1_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.DOWN_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.UP_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.DROP_NUM_INPUT],
            [States.PLAY, RuleAction.HIDE_ALL, Html.MINUS_DROP_NUM_BUTTON],

            [States.TURN, RuleAction.MESSAGE, "Mindenki dobjon be annyit, amennyi kártyája maradt!"],
            [States.TURN, RuleAction.HIDE_ALL, Html.MINUS_1_BUTTON],
            [States.TURN, RuleAction.SHOW_ALL, Html.DOWN_BUTTON],
            [States.TURN, RuleAction.SHOW_ALL, Html.UP_BUTTON],
            [States.TURN, RuleAction.SHOW_ALL, Html.DROP_NUM_INPUT],
            [States.TURN, RuleAction.SHOW_ALL, Html.MINUS_DROP_NUM_BUTTON],

            [States.SELECT_WINNER, RuleAction.MESSAGE, "Ki nyerte a kört? Névre katt/nyom."],

            [States.ALL, RuleAction.ALLOW_MINUS_AT_DROP_NUM, false],
            [States.ALL, RuleAction.DROP_DECREASE_POINT, true]

        ],
        40,
        100
    ),
    new Games.Game(
        "Alszik a város",
        [
            States.CHOOSE_PLAYERS,
            States.CHOOSE_ROLES, States.SHOW_PLAYERS, States.FIRST_NIGHT,
            States.DAY, States.NIGHT, States.MORNING],
        [
            [States.INITIAL, RuleAction.HIDE, Html.BASKET],
            [States.INITIAL, RuleAction.HIDE, Html.PLAY_BUTTON],
            [States.INITIAL, RuleAction.HIDE, Html.TURN_BUTTON],
            [States.INITIAL, RuleAction.HIDE_CLASS, Html.PLAYER_OP_CLASS],
            [States.INITIAL, RuleAction.HIDE_CLASS, Html.POINT_CLASS],
            [States.INITIAL, RuleAction.SHOW_CLASS, Html.ROLE_ICON_CLASS],
            [States.INITIAL, RuleAction.RUN, City.initGame],

            [States.CHOOSE_PLAYERS, RuleAction.SHOW_INLINE_BLOCK, Html.NEXT_BUTTON],
            [States.CHOOSE_PLAYERS, RuleAction.MESSAGE, "Válogasd össze a játékosokat, majd Tovább gomb!"],

            [States.CHOOSE_ROLES, RuleAction.HIDE_CLASS, Html.REMOVE_PLAYER_CLASS],
            [States.CHOOSE_ROLES, RuleAction.MESSAGE, "Válogasd össze a szerepeket, majd Tovább gomb!"],
            [States.CHOOSE_ROLES, RuleAction.RUN, City.fillChooseRoles],
            [States.CHOOSE_ROLES, RuleAction.SHOW, Html.CHOOSE_ROLES_OVERLAY],

            [States.SHOW_PLAYERS, RuleAction.RUN, City.saveActiveRoles],
            [States.SHOW_PLAYERS, RuleAction.HIDE, Html.CHOOSE_ROLES_OVERLAY],
            [States.SHOW_PLAYERS, RuleAction.RUN, City.setRandomRoles],

            [States.SHOW_PLAYERS, RuleAction.DISABLE_BUTTON, Html.NEXT_BUTTON],
            [States.SHOW_PLAYERS, RuleAction.RUN, City.testTestMode],
            [States.SHOW_PLAYERS, RuleAction.SHOW_ALL, Html.SHOW_PLAYER_CLASS],
            [States.SHOW_PLAYERS, RuleAction.MESSAGE, "Mutasd meg egyesével a játékosoknak a szerepüket!"],

            [States.FIRST_NIGHT, RuleAction.MESSAGE, "Első éjszaka, kövesd az utasításokat!"],
            [States.FIRST_NIGHT, RuleAction.SHOW, Html.FIRST_NIGHT_OVERLAY],
            [States.FIRST_NIGHT, RuleAction.RUN, City.firstNightChameleon],

            [States.DAY, RuleAction.MESSAGE, "Nappal van, mindenki ébren!"],
            [States.DAY, RuleAction.SHOW_ALL, Html.HANG_PLAYER_BUTTON],
            
            [States.NIGHT, RuleAction.MESSAGE, "Éjszaka van, mindenki aludjon!"],
            [States.NIGHT, RuleAction.HIDE_ALL, Html.HANG_PLAYER_BUTTON],

            [States.MORNING, RuleAction.MESSAGE, "Reggel van, mindenki ébredjen fel!"],
            [States.MORNING, RuleAction.RUN, City.morningCalculations],

            [States.CLOSING, RuleAction.HIDE_CLASS, Html.ROLE_ICON_CLASS],
            [States.CLOSING, RuleAction.SHOW_CLASS, Html.REMOVE_PLAYER_CLASS]
        ],
        0,
        0,
        States.DAY
    )
];
