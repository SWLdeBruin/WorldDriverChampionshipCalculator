const fs = require("fs");

const calculateCurrentDriverStandings = () => {
  const data = JSON.parse(fs.readFileSync("racedata.json").toString());
  const pointsForRace = data.pointsForRace;
  const pointsForSprintRace = data.pointsForSprintRace;
  const pointsForFastestLap = data.pointsForFastestLap;

  const currentDriverStandings = []

  for (const race of data.raceDataPerRace) {
    if (race.raceResults !== "Discontinued" || race.raceResults.length > 0) {
      let driverPosition = 0;
      for (const driverRaceResult of race.raceResults) {
        if (!driverRaceResult.includes("(DNF)")) {
          let driver = currentDriverStandings.find(driver => driver.driverName === driverRaceResult);

          if (!driver) {
            currentDriverStandings.push({
              driverName: driverRaceResult,
              points: 0
            });
          }
      
          if (driverPosition < 10) {
            driver = currentDriverStandings.find(driver => driver.driverName === driverRaceResult);
            
            if (driver) {
              driver.points += pointsForRace[driverPosition];
          
              if (driverRaceResult === race.raceFastestLap) {
                driver.points += pointsForFastestLap;
              }
            }
          }
      
          driverPosition++;
        }
      }

      driverPosition = 0;
      if (race.sprintResults !== undefined) {
        for (const driverSprintResult of race.sprintResults) {
          if (!driverSprintResult.includes("(DNF)")) {
            if (driverPosition < 8) {
              const driver = currentDriverStandings.find(driver => driver.driverName === driverSprintResult);
              
              if (driver) {
                driver.points += pointsForSprintRace[driverPosition];
              }
            }

            driverPosition++;
          }
        }
      }
    }
  }

  return currentDriverStandings.sort((a, b) => b.points - a.points);
}

module.exports = calculateCurrentDriverStandings;