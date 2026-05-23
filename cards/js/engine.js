// Game logic engine
const Engine = window.Engine = window.Engine || {};

Engine.fn = Object.assign( Engine.fn || {}, {
    runPhase() {
        let actGame = Games.fn.cgames[Games.fn.running];
        let actPhase = Games.fn.phase;
        for(let i = 0; i < actGame.rules.length; i++) {
            if (actGame.rules[i][0] == actPhase) {
                console.log("run rule: " + actGame.rules[i][1] + " on " + actGame.rules[i][2]);
                switch (actGame.rules[i][1]) {
                    case RuleAction.HIDE :
                        el(actGame.rules[i][2]).style.display = "none";
                        break;
                    case RuleAction.SHOW :
                        el(actGame.rules[i][2]).style.display = "block";
                        break;
                    case RuleAction.SHOW_INLINE_BLOCK :
                        el(actGame.rules[i][2]).style.display = "inline-block";
                        break;
                    case RuleAction.SHOW_FLEX :
                        el(actGame.rules[i][2]).style.display = "flex";
                        break;
                    case RuleAction.HIDE_ALL : 
                        hideElements(actGame.rules[i][2]);
                        break;
                    case RuleAction.SHOW_ALL : 
                        showElements(actGame.rules[i][2], "inline-block");
                        break;
                    case RuleAction.MESSAGE : 
                        message(actGame.rules[i][2]);
                        break;
                    default:
                        console.log("Unkonw rule action: " + actGame.rules[i][1] + " ("+i+". rule)");
                }
            }
        }
        if (actPhase == States.INITIAL) {
            for(i = 0; i < MAX_PLAYER_NUM; i++) {
                points[i] = actGame.startPoint;
            }
            refreshPoints();
        }
        if (actPhase == States.TURN) {
            for(i = 0; i < playerNum; i++) {
                lastPoints[i] = NO_LAST_POINT;
                addPoint(i, 0);
            }
        }
    },
    getValue(rule) {
        let actGame = Games.fn.cgames[Games.fn.running];
        let actPhase = Games.fn.phase;
        for(let i = 0; i < actGame.rules.length; i++) {
            if (actGame.rules[i][0] == actPhase || actGame.rules[i][0] == States.ALL) {
                if (actGame.rules[i][1] == rule) {
                    return actGame.rules[i][2];
                }
            }
        }
        for(let i = 0; i < RuleActionDefaultValue.length; i++) {
            if (RuleActionDefaultValue[i][0] == rule) {
                return RuleActionDefaultValue[i][1];
            }
        }
        return null;
    }
});