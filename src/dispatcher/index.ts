import { Elevator, Request, Floor } from "../elevator";

type Name = "A" | "B" | "C" | "D";

const NAMES: Name[] = ["A", "B", "C", "D"];

class NamedElevator {
  name: Name;
  elevator: Elevator;
}

interface CreationParameters {
  numberOfElevators: 1 | 2 | 3 | 4;
  capacityOfAnElevator: number;
}

export class Dispatcher {
  static create({ numberOfElevators, capacityOfAnElevator }: CreationParameters): Dispatcher {
    const elevators = [...Array(numberOfElevators)].map((_) => Elevator.create({ capacity: capacityOfAnElevator }));
    return new Dispatcher(elevators);
  }

  private elevators: Record<string, NamedElevator> = {};

  private constructor(elevators: Elevator[]) {
    elevators.forEach((elevator, index) => {
      const name = NAMES[index];
      this.elevators[name] = { name, elevator };
    });
  }

  request = (request: Request): Name => {
    const { name, elevator } = chooseElevator(Object.values(this.elevators))(request);
    this.elevators[name] = { name, elevator: elevator.request(request) };
    return name;
  };

  tick = () => {
    Object.values(this.elevators).forEach(({ name, elevator }) => {
      this.elevators[name] = { name, elevator: elevator.tick() };
    });
  };
}

const chooseElevator = (elevators: NamedElevator[]) => ({ from }: Request): NamedElevator => {
  const sortedElevators = [...elevators] //
    .sort(byAscendingQueueLength)
    .sort(byAscendingDistanceToFinalFloor(from));
  return sortedElevators[0];
};

const byAscendingQueueLength = (
  { elevator: elevator1 }: NamedElevator,
  { elevator: elevator2 }: NamedElevator
): number => {
  return elevator1.computeQueueLength() - elevator2.computeQueueLength();
};

const byAscendingDistanceToFinalFloor = (finalFloor: Floor) => (
  { elevator: elevator1 }: NamedElevator,
  { elevator: elevator2 }: NamedElevator
): number => {
  const d1 = distance(finalFloor, elevator1.computeFinalFloor());
  const d2 = distance(finalFloor, elevator2.computeFinalFloor());
  return d1 - d2;
};

function distance(floor1: Floor, floor2: Floor): number {
  return Math.abs(floor1 - floor2);
}
