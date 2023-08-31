import { IRace } from "./race";

export interface IRaceData {
  totalRaces: number;
  racesDiscontinued: number;
  pointsForRace: number[];
  pointsForSprintRace: number[];
  raceDataPerRace: IRace[];
}