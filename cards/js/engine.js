import {points, lastPoints, Common, el, MAX_PLAYER_NUM, NO_LAST_POINT} from './common.js';
import { RuleAction, RuleActionDefaultValue } from './rules.js';
import { States } from './states.js';
import { Games } from './games.js';
import { refreshPoints, message, showElements, hideElements, showClass, hideClass, addPoint } from './cards.js';

// Game logic engine
export const Engine = {
    runPhase() {
        let actGame = Games.cgames[Games.running];
        let actPhase = Games.phase;
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
                    case RuleAction.HIDE_CLASS : 
                        hideClass(actGame.rules[i][2]);
                        break;
                    case RuleAction.SHOW_CLASS : 
                        showClass(actGame.rules[i][2], "inline-block");
                        break;
                    case RuleAction.MESSAGE : 
                        message(actGame.rules[i][2]);
                        break;
                    case RuleAction.RUN :
                        actGame.rules[i][2]();
                        break;
                    case RuleAction.DISABLE_BUTTON :
                        el(actGame.rules[i][2]).disabled = true;
                        break;
                    default:
                        console.log("Unknown rule action: " + actGame.rules[i][1] + " ("+i+". rule)");
                }
            }
        }
        if (actPhase == States.INITIAL) {
            for(let i = 0; i < MAX_PLAYER_NUM; i++) {
                points[i] = actGame.startPoint;
            }
            refreshPoints();
        }
        if (actPhase == States.TURN) {
            for(let i = 0; i < Common.playerNum; i++) {
                lastPoints[i] = NO_LAST_POINT;
                addPoint(i, 0);
            }
        }
    },
    getValue(rule) {
        let actGame = Games.cgames[Games.running];
        let actPhase = Games.phase;
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
};