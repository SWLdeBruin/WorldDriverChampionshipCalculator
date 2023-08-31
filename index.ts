import fs from "fs";
import { IRaceData } from "./types/racedata";
import { IDriverPoints } from "./types/driverPoints";

const pointsFastestLap = 1;

const data: IRaceData = JSON.parse(fs.readFileSync("racedata.json"));

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
let currentResultsForChampionship = [];
let lowestResultsForChampionship = [];

const racesLeftThisSeason = data.raceDataPerRace.filter((race) => race.raceResults.length === 0);

let numberOneDriverPosition = 0;

if (currentDriverStandings.length > 0) {
  breakToThis:
  do {
    const topTwoDrivers: IDriverPoints[] = currentDriverStandings.slice(0, 2).map((driver) => ({...driver}));
    
    const numberOneDriver: IDriverPoints = {...topTwoDrivers.shift()};
  
    for (const race of racesLeftThisSeason) {
      const foundRace = currentResultsForChampionship.find((r) => r.raceName === race.raceName);
  
      if (foundRace) {
        const gainedPoints = numberOneDriverPosition < 10 ? pointsForRace[numberOneDriverPosition] : 0;
        numberOneDriver.points += gainedPoints;
        if (Array.isArray(race.sprintResults)) {
          numberOneDriver.points += pointsSprintRace[0];
        }
  
        let i = 0;
        for (let j = 0; j < topTwoDrivers.length; j++) {
          if (numberOneDriverPosition === i) { 
            i++;
          }
  
          topTwoDrivers[j].points += pointsRace[i];
          topTwoDrivers[j].points += pointsFastestLap;
          if (Array.isArray(race.sprintResults)) {
            topTwoDrivers[j].points += pointsSprintRace[i];
          }
          
          i++;
        }
  
        foundRace.raceResults = [
          {...numberOneDriver},
          ...topTwoDrivers.map((driver) => ({...driver}))
        ];
      } else {
        numberOneDriver.points += pointsRace[0];
        numberOneDriver.points += pointsFastestLap;
        if (Array.isArray(race.sprintResults)) {
          numberOneDriver.points += pointsSprintRace[0];
        }
  
        for (let i = 1; i <= topTwoDrivers.length; i++) {
          topTwoDrivers[i - 1].points += pointsRace[i];
  
          if (Array.isArray(race.sprintResults)) {
            topTwoDrivers[i - 1].points += pointsSprintRace[i];
          }
        }
  
        race.raceResults = [
          {...numberOneDriver},
          ...topTwoDrivers.map((driver) => ({...driver}))
        ];
  
        currentResultsForChampionship.push(race);
      }
    }
    
    const lastResult = currentResultsForChampionship[currentResultsForChampionship.length - 1].raceResults.sort((a, b) => b.points - a.points);
  
    canWinChampionship = lastResult[0].driverName == numberOneDriver.driverName;
  
    numberOneDriverPosition++;
  
    if (numberOneDriverPosition >= 20) {
      canWinChampionship = false;
      console.log(numberOneDriverPosition)
    }
    if (canWinChampionship) {
      lowestResultsForChampionship = currentResultsForChampionship;
    }
  } while (canWinChampionship);
  
  for (const race of currentResultsForChampionship) {
    console.log(race, numberOneDriverPosition);
  }
}
