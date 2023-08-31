import fs from "fs";
import { IRaceData } from "./types/racedata";
import { IDriverPoints } from "./types/driverPoints";
import { IRace } from "./types/race";
import { IChampionshipPrediction } from "./types/championschipPrediction";

const pointsFastestLap = 1;

const data: IRaceData = JSON.parse(fs.readFileSync("racedata.json").toString());

const raceCount = data.totalRaces;
const racesDiscontinued = data.racesDiscontinued;

const pointsForRace = data.pointsForRace;
const pointsForSprintRace = data.pointsForSprintRace;

const currentDriverStandings: IDriverPoints[] = []

for (const race of data.raceDataPerRace) {
  if (race.raceResults !== "Discontinued" || race.raceResults.length > 0) {
    let driverPosition = 0;
    for (const driverRaceResult of race.raceResults) {
      const driverName = driverRaceResult.replace(" (DNF)", "");
  
      let driver = currentDriverStandings.find(driver => driver.driverName === driverName);

      if (!driver) {
        currentDriverStandings.push({
          driverName,
          points: 0
        });
      }
  
      if (driverPosition < 10) {
        driver = currentDriverStandings.find(driver => driver.driverName === driverName);
        
        if (driver) {
          driver.points += pointsForRace[driverPosition];
      
          if (driverName === race.raceFastestLap) {
            driver.points += pointsFastestLap;
          }
        }
      }
  
      driverPosition++;
    }

    driverPosition = 0;
    if (race.sprintResults !== undefined) {
      for (const driverSprintResult of race.sprintResults) {
        const driverName = driverSprintResult.replace(" (DNF)", "");
    
        if (driverPosition < 8) {
          const driver = currentDriverStandings.find(driver => driver.driverName === driverName);
          
          if (driver) {
            driver.points += pointsForSprintRace[driverPosition];
          }
        }
    
        driverPosition++;
      }
    }
  }
}

currentDriverStandings.sort((a, b) => b.points - a.points);

let canWinChampionship = false;
let worstFinishingPositionPerRace: IChampionshipPrediction[] = [];

const racesToGo = data.raceDataPerRace.filter((raceData) => raceData.raceResults.length === 0);
const championshipLeader = {...currentDriverStandings[0]};
const championshipBestCompetitor = {...currentDriverStandings[1]};

// do {
  for (const race of racesToGo) {
    const finishedPosition = worstFinishingPositionPerRace.find((raceWithPosition) => race.raceName === raceWithPosition.raceName);
  
    if (finishedPosition === undefined) {
      let leaderPoints = championshipLeader.points;
      let competitorPoints = championshipBestCompetitor.points;
  
      leaderPoints += pointsFastestLap;
      leaderPoints += pointsForRace[0];
      if (race.sprintResults !== undefined) {
        leaderPoints += pointsForSprintRace[0];
      }
  
      championshipLeader.points = leaderPoints;
  
      competitorPoints += pointsForRace[1];
      if (race.sprintResults !== undefined) {
        competitorPoints += pointsForSprintRace[1];
      }
  
      championshipBestCompetitor.points = competitorPoints;
  
      const newRacePrediction: IChampionshipPrediction = {
        raceName: race.raceName,
        raceResults: [
          {
            driverName: championshipLeader.driverName,
            points: leaderPoints
          },
          {
            driverName: championshipBestCompetitor.driverName,
            points: competitorPoints
          }
        ],
        worstFinishingPosition: 1
      }
  
      worstFinishingPositionPerRace.push(newRacePrediction);
    } else {
      
    }
  }


// } while(!canWinChampionship);

for (const race of worstFinishingPositionPerRace) {
  console.log(race.raceName)

  console.log(race.raceResults)

  console.log(race.worstFinishingPosition)
}




// let canWinChampionship = false;
// let currentResultsForChampionship: IChampionshipPrediction[] = [];
// let lowestResultsForChampionship: IChampionshipPrediction[] = [];

// const racesLeftThisSeason = data.raceDataPerRace.filter((race) => race.raceResults.length === 0);

// if (currentDriverStandings.length > 0) {
//   let numberOneDriverPosition = 0;

//   do {
//     const topTwoDrivers: IDriverPoints[] = currentDriverStandings.slice(0, 2).map((driver) => ({...driver}));
    
//     const numberOneDriver: IDriverPoints = {...topTwoDrivers.shift()!};
  
//     for (const race of racesLeftThisSeason) {
//       const foundRace = currentResultsForChampionship.find((r) => r.raceName === race.raceName);
  
//       if (foundRace) {
//         const gainedPoints = numberOneDriverPosition < 10 ? pointsForRace[numberOneDriverPosition] : 0;
//         numberOneDriver.points += gainedPoints;
//         if (Array.isArray(race.sprintResults)) {
//           numberOneDriver.points += pointsForSprintRace[0];
//         }
  
//         let i = 0;
//         for (let j = 0; j < topTwoDrivers.length; j++) {
//           if (numberOneDriverPosition === i) { 
//             i++;
//           }
  
//           topTwoDrivers[j].points += pointsForRace[i];
//           topTwoDrivers[j].points += pointsFastestLap;
//           if (Array.isArray(race.sprintResults)) {
//             topTwoDrivers[j].points += pointsForSprintRace[i];
//           }
          
//           i++;
//         }
  
//         foundRace.raceResults = [
//           {...numberOneDriver},
//           ...topTwoDrivers.map((driver) => ({...driver}))
//         ];
//       } else {
//         const newRace: IChampionshipPrediction = {
//           raceName: race.raceName,
//           raceResults: []
//         }
//         numberOneDriver.points += pointsForRace[0];
//         numberOneDriver.points += pointsFastestLap;
//         if (Array.isArray(race.sprintResults)) {
//           numberOneDriver.points += pointsForSprintRace[0];
//         }
  
//         for (let i = 1; i <= topTwoDrivers.length; i++) {
//           topTwoDrivers[i - 1].points += pointsForRace[i];
  
//           if (Array.isArray(race.sprintResults)) {
//             topTwoDrivers[i - 1].points += pointsForSprintRace[i];
//           }
//         }
  
//         newRace.raceResults = [
//           {...numberOneDriver},
//           ...topTwoDrivers.map((driver) => ({...driver}))
//         ];
  
//         currentResultsForChampionship.push(newRace);
//       }
//     }
    
//     const lastResult = currentResultsForChampionship[currentResultsForChampionship.length - 1].raceResults.sort((a, b) => b.points - a.points);
  
//     canWinChampionship = lastResult[0].driverName == numberOneDriver.driverName;
  
//     numberOneDriverPosition++;
  
//     if (numberOneDriverPosition >= 20) {
//       canWinChampionship = false;
//       console.log(numberOneDriverPosition)
//     }
//     if (canWinChampionship) {
//       lowestResultsForChampionship = currentResultsForChampionship;
//     }
//   } while (canWinChampionship);
  
//   for (const race of currentResultsForChampionship) {
//     console.log(race, numberOneDriverPosition);
//   }
// }
