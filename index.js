const fs = require("fs");

const calculateCurrentDriverStandings = require("./functions/calculateCurrentDriverStandings");

const data = JSON.parse(fs.readFileSync("racedata.json").toString());

const pointsForRace = data.pointsForRace;
const pointsForSprintRace = data.pointsForSprintRace;
const pointsFastestLap = data.pointsForFastestLap;

const currentDriverStandings = calculateCurrentDriverStandings();

let canWinChampionship = false;
let worstFinishingPositionPerRace = [];

const racesDriven = data.raceDataPerRace.filter((raceData) => raceData.raceResults.length > 0);
const racesToGo = data.raceDataPerRace.filter((raceData) => raceData.raceResults.length === 0);
const championshipLeader = {...currentDriverStandings[0]};
const championshipBestCompetitor = {...currentDriverStandings[1]};

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

    const newRacePrediction = {
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
  }
}

if (championshipLeader.driverName === worstFinishingPositionPerRace[worstFinishingPositionPerRace.length - 1].raceResults.sort((a, b) => b.points - a.points)[0].driverName) {
  canWinChampionship = true;

  console.log("Current standings")
  console.log(currentDriverStandings)
} else {
  canWinChampionship = false;
}

while (canWinChampionship) {
  const raceFinishesInsidePoints = worstFinishingPositionPerRace.filter((race) => race.worstFinishingPosition <= pointsForRace.length);
  const finishesOutsidePoints = worstFinishingPositionPerRace.filter((race) => race.worstFinishingPosition > pointsForRace.length);
  
  const lastRaceInsidePoints = raceFinishesInsidePoints[raceFinishesInsidePoints.length - 1];

  if (lastRaceInsidePoints === undefined) {
    canWinChampionship = false;
    break;
  }

  let secondToLastRaceInsidePoints = raceFinishesInsidePoints[raceFinishesInsidePoints.length - 2];

  if (secondToLastRaceInsidePoints === undefined) {
    const lastDrivenRace = racesDriven[racesDriven.length - 1];

    secondToLastRaceInsidePoints = {
      raceName: lastDrivenRace.raceName,
      raceResults: [
        {
          driverName: currentDriverStandings[0].driverName,
          points: currentDriverStandings[0].points
        },
        {
          driverName: currentDriverStandings[1].driverName,
          points: currentDriverStandings[1].points
        }
      ]
    }
  }

  const newChampionshipLeader = {...secondToLastRaceInsidePoints.raceResults[0]};
  const newChampionshipBestCompetitor = {...secondToLastRaceInsidePoints.raceResults[1]};

  const isSprintRace = racesToGo.find((race) => race.raceName === lastRaceInsidePoints.raceName)?.sprintResults !== undefined;

  const newFinishingPosition = lastRaceInsidePoints.worstFinishingPosition + 1;

  let leaderPoints = newChampionshipLeader.points;
  let competitorPoints = newChampionshipBestCompetitor.points;

  if (newFinishingPosition <= pointsForRace.length) {
    leaderPoints += pointsForRace[newFinishingPosition - 1];
  }

  competitorPoints += pointsFastestLap;
  competitorPoints += pointsForRace[0];
  
  if (isSprintRace) {
    if (newFinishingPosition < pointsForSprintRace.length) {
      leaderPoints += pointsForSprintRace[newFinishingPosition - 1];
    }
    competitorPoints += pointsForSprintRace[0];
  }

  newChampionshipLeader.points = leaderPoints;
  newChampionshipBestCompetitor.points = competitorPoints;
  
  lastRaceInsidePoints.raceResults = [
    {
      driverName: newChampionshipLeader.driverName,
      points: leaderPoints
    },
    {
      driverName: newChampionshipBestCompetitor.driverName,
      points: competitorPoints
    }
  ];
  lastRaceInsidePoints.worstFinishingPosition = newFinishingPosition;

  for (let i = 0; i < finishesOutsidePoints.length; i++) {
    const finishOutsidePoints = finishesOutsidePoints[i];
    let raceBefore;
    if (i > 0) {
      raceBefore = finishesOutsidePoints[i - 1];
    } else {
      raceBefore = lastRaceInsidePoints;
    }
    const isFinishOutsidePointsSprintRace = racesToGo.find((race) => race.raceName === finishOutsidePoints.raceName)?.sprintResults !== undefined;

    const championshipLeaderRacesOutsidePoints = {...raceBefore.raceResults[0]};
    const championshipBestCompetitorRacesOutsidePoints = {...raceBefore.raceResults[1]};

    let leaderPoints = championshipLeaderRacesOutsidePoints.points;
    let competitorPoints = championshipBestCompetitorRacesOutsidePoints.points;

    if (finishOutsidePoints.worstFinishingPosition < pointsForRace.length) {
      leaderPoints += pointsForRace[finishOutsidePoints.worstFinishingPosition - 1];
    }

    competitorPoints += pointsFastestLap;
    competitorPoints += pointsForRace[0];
    
    if (isFinishOutsidePointsSprintRace) {
      if (finishOutsidePoints.worstFinishingPosition < pointsForSprintRace.length) {
        leaderPoints += pointsForSprintRace[finishOutsidePoints.worstFinishingPosition - 1];
      }
      competitorPoints += pointsForSprintRace[0];
    }

    championshipLeaderRacesOutsidePoints.points = leaderPoints;
    championshipBestCompetitorRacesOutsidePoints.points = competitorPoints;
    
    finishOutsidePoints.raceResults = [
      {
        driverName: championshipLeaderRacesOutsidePoints.driverName,
        points: leaderPoints
      },
      {
        driverName: championshipBestCompetitorRacesOutsidePoints.driverName,
        points: competitorPoints
      }
    ];
  }

  worstFinishingPositionPerRace[worstFinishingPositionPerRace.length - 1].raceResults.sort((a, b) => b.points - a.points);

  if (championshipLeader.driverName === worstFinishingPositionPerRace[worstFinishingPositionPerRace.length - 1].raceResults[0].driverName) {
    canWinChampionship = true;
  } else {
    canWinChampionship = false;
  }
}

console.log("Final prediction")
for (const race of worstFinishingPositionPerRace) {
  console.log(race.raceName)

  console.log(race.raceResults)

  console.log(race.worstFinishingPosition)

  console.log("")
  console.log("----------------------------------")
  console.log("")
}