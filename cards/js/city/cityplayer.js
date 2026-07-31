// Game logic engine
export const CityPlayers = {
    KILLER : { id: 1, img: "knife-svgrepo-com.svg"},
    MAFFIA : { id: 2, img: "pistol-svgrepo-com.svg"},
    POLICE : { id: 3, img: "police-mark-svgrepo-com.svg"},
    DOCTOR : { id: 4, img: "doctor-briefcase-svgrepo-com.svg"},
    CUPIDO : { id: 5, img: "cupid-heart-svgrepo-com.svg"},
    DIRECTOR : { id: 6, img: "director-authority-boss-master-svgrepo-com.svg"},
    NEIGHBOUR : { id: 7, img: "friend-2-svgrepo-com.svg"},
    CHAMELEON : { id: 8, img: "chameleon-svgrepo-com.svg"},
    CLOWN : { id: 9, img: "clown-face-svgrepo-com.svg"},
    PRIEST : { id: 10, img: "priest-1-svgrepo-com.svg"},
    WITCH : { id: 11, img: "witch-flying-broom-svgrepo-com.svg"},
    BAKER : { id: 12, img: "loaf-of-bread-svgrepo-com.svg"},
    CITIZEN : { id: 50, img: ""},
    UNKNOWN : { id: 100, img: "severity-unknown-svgrepo-com.svg"}
}

CityPlayers.ROLES = [ CityPlayers.KILLER, CityPlayers.MAFFIA, CityPlayers.POLICE,
             CityPlayers.DOCTOR, CityPlayers.CUPIDO, CityPlayers.DIRECTOR,
             CityPlayers.NEIGHBOUR, CityPlayers.CHAMELEON, CityPlayers.CLOWN,
             CityPlayers.PRIEST, CityPlayers.WITCH, CityPlayers.BAKER
];

console.log("CityPlayers read.");