import { IDriver } from "./driver";
import { IDriverPoints } from "./driverPoints";

export interface IRace {
  raceName: string;
  raceResults: IDriver[] | "Discontinued";
  sprintResults?: IDriver[];
  raceFastestLap?: IDriver;
}