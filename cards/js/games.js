// games
const Games = window.Games = window.Games || {};

Games.fn = Object.assign( Games.fn || {}, {
    Game : class {
        constructor(name, states, rules, startPoint, endPoint) {
            this.name = name;
            this.states = states;
            this.rules = rules;
            this.startPoint = startPoint;
            this.endPoint = endPoint;
        }
    },
    // games
    JAGO : 0,
    LORUM : 1,
    // runnng game and phase
    running : 0, // actual running game index
    phase : 0, // actual phase of the game
    showChangeTheGame() {
        console.log("Game.change");
        el(Html.GAME_CHANGE_MODAL).style.display = "flex";
        el(Html.QUIT_SELECT_GAME_BUTTON).onclick = function(){
            el(Html.GAME_CHANGE_MODAL).style.display = "none";
        };
        el(Html.SELECT_GAME_BUTTON).onclick = Games.fn.changeTheGame;
        let select = el(Html.SELECT_GAME);
        select.options.length = 0;
        for(let i = 0; i < Games.fn.cgames.length; i++) {
            select.appendChild(makeOption(i, Games.fn.cgames[i].name));
        }
    },
    changeTo(newGame) {
        el(Html.GAME_NAME_DIV).innerHTML = Games.fn.cgames[newGame].name;
        Games.fn.phase = States.CLOSING;
        Engine.fn.runPhase();

        Games.fn.running = newGame;
        Games.fn.phase = States.INITIAL;
        Engine.fn.runPhase();

        Games.fn.setPhase(States.PLAY);
    },
    changeTheGame() {
        if (el(Html.SELECT_GAME).value != Games.fn.running) {
            Games.fn.changeTo(el(Html.SELECT_GAME).value);
        }
        el(Html.GAME_CHANGE_MODAL).style.display = "none";
    },
    initButtons() {
        el(Html.CHANGE_GAME_BUTTON).onclick = Games.fn.showChangeTheGame;
    },
    setPhase(newPhase) {
        Games.fn.phase = newPhase;
        Engine.fn.runPhase();
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
        let game = Games.fn.cgames[Games.fn.running];
        let i = game.states.indexOf(Games.fn.phase);
        i++;
        if (i >= game.states.length || i == -1) {
            i = 0;
        }
        Games.fn.setPhase(game.states[i]);
    }
});

Games.fn.cgames = [
    new Games.fn.Game(
        "Jágó",
        [States.PLAY, States.TURN],
        [
            [States.INITIAL, RuleAction.HIDE_ALL, Html.MINUS_1_BUTTON],
            [States.INITIAL, RuleAction.HIDE_ALL, Html.DOWN_BUTTON],
            [States.INITIAL, RuleAction.HIDE_ALL, Html.UP_BUTTON],
            [States.INITIAL, RuleAction.HIDE_ALL, Html.DROP_NUM_INPUT],
            [States.INITIAL, RuleAction.HIDE_ALL, Html.MINUS_DROP_NUM_BUTTON],
            [States.INITIAL, RuleAction.HIDE, Html.BASKET],

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
    new Games.fn.Game(
        "Lórum",
        [States.PLAY, States.TURN, States.SELECT_WINNER],
        [
            [States.INITIAL, RuleAction.SHOW_INLINE_BLOCK, Html.BASKET],
            [States.CLOSING, RuleAction.HIDE, Html.BASKET],

            [States.PLAY, RuleAction.MESSAGE, "Dobjatok be egyet, ha kell!"],
            [States.PLAY, RuleAction.SHOW_ALL, Html.MINUS_1_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.DOWN_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.UP_BUTTON],
            [States.PLAY, RuleAction.HIDE_ALL, Html.DROP_NUM_INPUT],
            [States.PLAY, RuleAction.HIDE_ALL, Html.MINUS_DROP_NUM_BUTTON],

            [States.TURN, RuleAction.MESSAGE, "MIndenki dobjon be annyit, amennyi kártyája maradt!"],
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
    )
];
