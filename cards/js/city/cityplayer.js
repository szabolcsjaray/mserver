// Game logic engine
export const CityPlayers = {
    KILLER : { id: 1, img: "knife-svgrepo-com.svg", nev: "Gyilkos", desc: "Ölj meg egy polgárt éjjel a Maffiavezérrel együtt! Ha már nincs, akkor egyedül.", basic: true, evil: true},
    MAFFIA : { id: 2, img: "mafia-boss-svgrepo-com.svg", nev: "Maffiavezér", desc: "Ölj meg egy polgárt éjjel a Gyilkossal együtt! Ha már nincs, akkor egyedül. A rendőr nem tud leleplezni.", basic: true, evil: true},
    POLICE : { id: 3, img: "police-mark-svgrepo-com.svg", nev: "Rendőr", desc: "Éjjel gyanúsíts meg valakit, hogy megtudd, gyilkos-e.", basic: true, evil: false},
    DOCTOR : { id: 4, img: "doctor-briefcase-svgrepo-com.svg", nev: "Orvos", desc: "Éjjel gyógyíts meg valakit. Ha őt ölnék meg, megmenekül.", basic: true, evil: false},
    CUPIDO : { id: 5, img: "cupid-heart-svgrepo-com.svg", nev: "Cupido", desc: "Köss össze minden éjjel 2 embert! Ha az egyik meghal éjjel vagy nappal, a másik is meghal vele.", basic: false, evil: false},
    DIRECTOR : { id: 6, img: "director-authority-boss-master-svgrepo-com.svg", nev: "Igazgató", desc: "Az első éjjel megtudod egy ember szerepét. Minden szavazáskor 2-t ér a te szavazatod.", basic: false, evil: false},
    NEIGHBOUR : { id: 7, img: "friend-2-svgrepo-com.svg", nev: "Szomszéd", desc: "Éjjel menj be valakihez! Ha polgár, véditek egymást, de legközelebb máshoz kell menned, ha gyilkos, megöl.", basic: false, evil: false},
    CHAMELEON : { id: 8, img: "chameleon-svgrepo-com.svg", nev: "Kaméleon", desc: "Az első éjjel felveszed egy másik játékos szerepét a játék végéig.", basic: false, evil: false},
    CLOWN : { id: 9, img: "clown-face-svgrepo-com.svg", nev: "Bohóc", desc: "Ha felakasztanak, nyersz.", basic: false, evil: false},
    PRIEST : { id: 10, img: "priest-1-svgrepo-com.svg", nev: "Pap", desc: "Éjjel megtudod egy halottról, hogy gyilkos volt-e. A játék során egyszer feltámaszthatsz valakit.", basic: false, evil: false},
    WITCH : { id: 11, img: "witch-flying-broom-svgrepo-com.svg", nev: "Banya", desc: "Éjjel vagy megölsz vagy megmentesz valakit a gyilkosoktól.", basic: false, evil: false},
    BAKER : { id: 12, img: "loaf-of-bread-svgrepo-com.svg", nev: "Pék", desc: "Ha meghalsz, 3 körön belül végetér a játék a te győzelmeddel.", basic: false, evil: false},
    HOOVER : { id: 13, img: "vacuum-cleaner-svgrepo-com.svg", nev: "Porszívóügynök", desc: "Minden éjjel megajándékozol valakit egy porszívóval.", basic: false, evil: false},
    WATERGUN : { id: 14, img: "water-gun-svgrepo-com.svg", nev: "Vízipisztolyos", desc: "Minden éjjel valakit lelősz a vízipisztolyoddal. Ha ő kapott porszívót, meghal.", basic: false, evil: false},
    CITIZEN : { id: 50, img: "", nev: "Polgár", desc: "Különleges képesség nélküli polgár vagy.", basic: false, evil: false},
    UNKNOWN : { id: 100, img: "severity-unknown-svgrepo-com.svg", nev: "", desc: "", basic: false, evil: false}
}

CityPlayers.ROLES = [ CityPlayers.KILLER, CityPlayers.MAFFIA, CityPlayers.POLICE,
             CityPlayers.DOCTOR, CityPlayers.CUPIDO, CityPlayers.DIRECTOR,
             CityPlayers.NEIGHBOUR, CityPlayers.CHAMELEON, CityPlayers.CLOWN,
             CityPlayers.PRIEST, CityPlayers.WITCH, CityPlayers.BAKER, CityPlayers.HOOVER, CityPlayers.WATERGUN
];

console.log("CityPlayers read.");