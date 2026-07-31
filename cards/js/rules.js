export const RuleAction = {
    SHOW: 0,
    HIDE: 1,
    SHOW_INLINE_BLOCK : 2,
    SHOW_FLEX : 3,
    HIDE_ALL: 4,
    SHOW_ALL : 5,
    MESSAGE : 6,
    HIDE_CLASS : 7,
    RUN : 8,

    ALLOW_MINUS_AT_DROP_NUM : 100,
    DROP_DECREASE_POINT: 101,

    ZERO_POINT: 2000
};

export const RuleActionDefaultValue  = [
    [RuleAction.ALLOW_MINUS_AT_DROP_NUM , false],
    [RuleAction.DROP_DECREASE_POINT, false]
];
