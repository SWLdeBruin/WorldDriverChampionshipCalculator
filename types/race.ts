import { IDriver } from "./driver";

export interface IRace {
  raceName: string;
  raceResults: IDriver[] | "Discontinued";
  sprintResults?: IDriver[];
  raceFastestLap?: IDriver;
}