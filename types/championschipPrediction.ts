import { IDriverPoints } from "./driverPoints";

export interface IChampionshipPrediction {
  raceName: string;
  raceResults: IDriverPoints[],
  worstFinishingPosition: number
}