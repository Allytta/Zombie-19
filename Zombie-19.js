'use strict';

const persons = [
  {
    "name":"Jeanne",
    "group": [
        {"name":"Camille",
         "group": [],
         "infected":false,
         "age":45,
         "isDead":false,
         "infectedBy":"",
         "immunisedTo":""
        },
        {"name":"Julia",
         "group": [],
         "infected":false,
         "age":15,
         "isDead":false,
         "infectedBy":"",
         "immunisedTo":"",
        },
        {"name":"Marie",
         "group": [
            {"name":"Jean",
                 "group": [],
                "infected":false,
                "age":58,
                 "isDead":false,
                 "infectedBy":"",
                 "immunisedTo":"",
            },
             {"name":"Martine",
                 "group": [
                     {"name":"Pascal",
                     "group": [],
                    "infected":false,
                      "age":20,
                     "isDead":false,
                     "infectedBy":"",
                     "immunisedTo":"",
                    }
                 ],
                "infected":false,
              "age":58,
             "isDead":false,
             "infectedBy":"",
             "immunisedTo":"",
            }
         ],
         "infected":true,
         "age":35,
         "isDead":false,
         "infectedBy":"zombieA",
         "immunisedTo":"",
        }
    ],
    "infected":false,
    "age":27,
     "isDead":false,
     "infectedBy":"",
     "immunisedTo":"",
  },
    {"name":"Paul",
    "group": [],
     "infected":false,
     "age":25,
     "isDead":false,
     "infectedBy":"",
     "immunisedTo":"",
    }
];


// Zombie-A : infecte du haut vers le bas
function infectA(data) {
  data.forEach((item) => {
    if (!item.isDead && item.immunisedTo !== "ALL") {
      item.infected = true;
      item.infectedBy = "zombieA";
    }
    if (item.group.length > 0) {
      infectA(item.group);
    }
  });
}

function zombieA(data, depth = 0) {
  data.forEach((item) => {
    if (item.infected) {
      infectA(data);
    }
    if (item.group.length > 0) {
      zombieA(item.group);
    }
  });
}


// Zombie-B : infecte du bas vers le haut les personnes de tout les groupes sociaux Ascendant
function infectB(data, oldestData, path, depth = 0) {
  oldestData.forEach((item, i) => {
    if (!item.isDead && item.immunisedTo !== "ALL") {
      item.infected = true;
      item.infectedBy = "zombieB";
    }
    if (item.group.length > 0 && path[depth] === i && path.length > depth) {
      infectB(data, item.group, path, depth + 1);
    }
  });
}
function zombieB(data, oldData, path, depth = 0) {
  let oldestData = [...oldData];
  data.forEach((item, i) => {
    if (item.infected) {
      infectB(data, oldestData, path);
    }
    if (item.group.length > 0) {
      path[depth] = i;
      zombieB(item.group, oldestData[i].group, path, depth + 1);
    }
  });
}



// Zombie-C : infecte une personne sur 2 dans un groupe social (mais pas les groupes sociaux en contact Ascendant ou Descendant)
function infectC(data) {
    for (let i = 0; i < data.length; i++) {
        const currentData = data[i];
        if (currentData.isDead || currentData.immunisedTo === "ALL") {
            continue;
        }
        currentData.infected = true;
        currentData.infectedBy = "zombieC";
    }
}
function zombieC(data) {
    for (let i = 0; i < data.length; i++) {
        const currentData = data[i];
        if (currentData.infected) {
            infectC(data);
        }
        if (currentData.group.length > 0) {
            zombieC(currentData.group);
        }
    }
}



// Zombie-32 : infecte du haut vers le bas et du bas vers le haut les personnes de 32 ans et plus
function zombie32(data, oldData, path = [], depth = 0) {
    for (let i = 0; i < data.length; i++) {
        const { infected, age } = data[i];
        if (infected && age > 32) {
            infectB(data, oldData, path);
            infectA(oldData);
        }
        if (data[i].group.length > 0) {
            zombie32(data[i].group, oldData, [...path, i], depth + 1);
        }
    }
}



// Zombie-Ultime : infecte seulement la personne racine la plus Ascendante (La personne la plus haute de tous les cercles social)
function infectUltime(data, oldData, path, depth = 0) {
  const [currentIndex] = path.slice(depth);
  const currentData = oldData[currentIndex];
  if (!currentData || currentData.isDead || currentData.immunisedTo === "ALL") {
    return;
  }
  currentData.infected = true;
  currentData.infectedBy = "zombieUltime";
}
function zombieUltime(data, oldData, path = [], depth = 0) {
  for (const currentData of oldData) {
    if (currentData.infected && !currentData.isDead && currentData.immunisedTo !== "ALL") {
      infectUltime(data, oldData, path, depth);
    }
    if (currentData.group.length > 0) {
      path[depth] = currentData.group[0].id;
      zombieUltime(data, currentData.group, path, depth + 1);
    }
  }
}



// VaccinA1
function  VaccinA1(data){
    for (let i = 0; i < data.length; i++) {
        if(data[i].isDead == false && data[i].infected == true && (data[i].infectedBy == "zombieA" || data[i].infectedBy == "zombie32")){
            if(data[i].age <= 30){
                data[i].infected = false;
                data[i].immunisedTo = "ALL";
            }
        }
        if(data[i].group.length > 0){
             VaccinA1(data[i].group);
        }
    }
}



//VaccinB1
function  VaccinB1(data,boolean){
    for (let i = 0; i < data.length; i++) {
        if(data[i].isDead == false && data[i].infected == true && (data[i].infectedBy == "zombieB" || data[i].infectedBy == "zombieC")){
            if(boolean == false){
                boolean = true;
                data[i].infected = false;
                data[i].immunisedTo = "";
            }else{
                boolean = false;
                data[i].isDead = true;
                data[i].infected = true;
                data[i].immunisedTo = "";
            }
        }
        if(data[i].group.length > 0){
             VaccinB1(data[i].group,boolean);
        }
    }
}



//VaccinUltime
function  VaccinUltime(data){
    for (let i = 0; i < data.length; i++) {
        if(data[i].isDead == false && data[i].infected == true && data[i].infectedBy == "zombieUltime"){
                data[i].infected = false;
                data[i].immunisedTo = "ALL";
        }
    }
}



// Affichage
function show(data, depth = 0) {
  const depthChar = " ".repeat(depth);
  data.forEach((item) => {
    const hasGroup = item.group && item.group.length > 0;
    if (item.infected) {
      if (hasGroup) {
        console.log(`${depthChar}${item.name} ${item.isDead ? 'DEAD ->' : 'INFECTED ->'}`);
        show(item.group, depth + 1);
      } else {
        console.log(`${depthChar}${item.name} ${item.isDead ? 'DEAD' : 'INFECTED'}`);
      }
    } else if (!hasGroup) {
      console.log(`${depthChar}${item.name}${item.isDead ? ' DEAD' : ''}`);
    } else {
      console.log(`${depthChar}${item.name} ${item.isDead ? 'DEAD ->' : '->'}`);
      show(item.group, depth + 1);
    }
  });
}

let path = [];
function showZombieA(){
  console.log("--------------------------------------------");
  console.log("ZOMBIE A :");
  console.log("--------------------------------------------");
  show(persons);
  zombieA(persons);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("INFECTION A :");
  show(persons);
  VaccinA1(persons);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("VACCINATION A :");
  show(persons);
};

function showZombieB(){
  console.log("--------------------------------------------");
  let alterPersonsZombieB = [...persons];
  console.log("ZOMBIE B :");
  console.log("--------------------------------------------");
  show(persons);
  zombieB(persons,alterPersonsZombieB,path);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("INFECTION B :");
  show(alterPersonsZombieB);
  VaccinB1(persons,false);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("VACCINATION B :");
  show(alterPersonsZombieB);
};

function showZombieC(){
  console.log("--------------------------------------------");
  console.log("ZOMBIE C :");
  console.log("--------------------------------------------");
  show(persons);
  zombieC(persons);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("INFECTION C :");
  show(persons);
  VaccinB1(persons,false);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("VACCINATION C :");
  show(persons);    
};

function showZombie32(){
  console.log("--------------------------------------------");
  let alterPersonsZombie32 = [...persons];
  console.log("ZOMBIE 32 :");
  console.log("--------------------------------------------");
  show(persons);
  zombie32(persons,alterPersonsZombie32,path);
  console.log("INFECTION 32 :");
  show(alterPersonsZombie32);
  VaccinA1(alterPersonsZombie32,false);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("VACCINATION 32 :");
  show(alterPersonsZombie32);
};

function showZombieUltimate(){
  console.log("--------------------------------------------");
  let alterPersonsZombieUltimate = [...persons];
  console.log("ZOMBIE ULTIMATE :");
  console.log("--------------------------------------------");
  show(persons);
  zombieUltime(persons,alterPersonsZombieUltimate,path);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("INFECTION ULTIMATE :");
  show(alterPersonsZombieUltimate);
  console.log(alterPersonsZombieUltimate);
  VaccinUltime(alterPersonsZombieUltimate,false);
  console.log("- - - - - - - - - - - - - - - - - - - - - - ");
  console.log("VACCINATION ULTIMATE :");
  show(alterPersonsZombieUltimate);
};

showZombieA();
//showZombieB();
//showZombieC();
//showZombie32();
//showZombieUltimate();