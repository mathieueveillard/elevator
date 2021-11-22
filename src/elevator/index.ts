import isEmpty from "../utils/isEmpty";

export type Floor = number;

export interface Request {
  from: Floor;
  to: Floor;
}

export type Ride = Request & {
  persons: number;
};

interface CreationParameters {
  capacity: number;
}

interface HandleFunction {
  (currentRide: Ride, additionalRide: Ride): Ride[];
}

interface UnaryHandleFunction {
  (currentRide: Ride, additionalRide: Ride): [Ride];
}

interface BinaryHandleFunction {
  (currentRide: Ride, additionalRide: Ride): [Ride, Ride];
}

interface TernaryHandleFunction {
  (currentRide: Ride, additionalRide: Ride): [Ride, Ride, Ride];
}

export class Elevator {
  static create({ capacity }: CreationParameters): Elevator {
    return new Elevator(capacity, [], 0);
  }

  private constructor(
    private readonly capacity: number,
    public readonly rides: Ride[],
    public readonly floor: number
  ) {}

  request = (request: Request): Elevator => {
    if (request.to === request.from) {
      return this;
    }

    const ride: Ride = { ...request, persons: 1 };

    const rides = this.mergeAdditionalRideToExistingOnes(this.rides, ride);

    return new Elevator(this.capacity, rides, this.floor);
  };

  tick = (): Elevator => {
    if (isEmpty(this.rides)) {
      return this;
    }

    const [{ to }, ...remainingRides] = this.rides;

    if (this.floor === to - 1) {
      return new Elevator(this.capacity, remainingRides, this.floor + 1);
    }

    if (this.floor < to) {
      return new Elevator(this.capacity, this.rides, this.floor + 1);
    }

    if (this.floor === to + 1) {
      return new Elevator(this.capacity, remainingRides, this.floor - 1);
    }

    if (this.floor > to) {
      return new Elevator(this.capacity, this.rides, this.floor - 1);
    }
  };

  computeQueueLength = (): number => {
    return this.rides.length;
  };

  computeFinalFloor = (): Floor => {
    const length = this.rides.length;

    if (length === 0) {
      return this.floor;
    }

    const { to } = this.rides[length - 1];
    return to;
  };

  private mergeAdditionalRideToExistingOnes = (rides: Ride[], additionalRide: Ride): Ride[] => {
    if (!isEmpty(rides)) {
      return this.mergeRecursively(rides, additionalRide);
    }

    if (additionalRide.from === this.floor) {
      return appendFirstRideFromActualFloor(additionalRide);
    }
    return appendFirstRide(this.floor, additionalRide);
  };

  private mergeRecursively = (rides: Ride[], additionalRide: Ride): Ride[] => {
    const [currentRide] = rides;
    if (isGoingUp(currentRide)) {
      return this.mergeRecursivelyCurrentRideGoingUp(rides, additionalRide);
    }
    return this.mergeRecursivelyCurrentRideGoingDown(rides, additionalRide);
  };

  private mergeRecursivelyCurrentRideGoingDown = (rides: Ride[], additionalRide: Ride): Ride[] => {
    const symetricalRides = rides.map(computeSymetricalRide);
    const symetricalAdditionalRide = computeSymetricalRide(additionalRide);
    const symetricalResult = this.mergeRecursivelyCurrentRideGoingUp(symetricalRides, symetricalAdditionalRide);
    return symetricalResult.map(computeSymetricalRide);
  };

  private mergeRecursivelyCurrentRideGoingUp = (rides: Ride[], additionalRide: Ride): Ride[] => {
    const [currentRide] = rides;

    if (currentRide.to < additionalRide.from) {
      /* [1]
       * -----> currentRide
       *           -----> additionalRide (up or down)
       */
      return this.handleIfLast(appendRide)(rides)(additionalRide);
    }

    if (currentRide.to === additionalRide.from) {
      /* [2]
       * -----> currentRide
       *       -----> additionalRide (up or down)
       */
      return this.handleIfLast(appendAdjacentRide)(rides)(additionalRide);
    }

    if (additionalRide.from < currentRide.from) {
      /* [3]
       *           -----> currentRide
       * -----> additionalRide (up or down)
       */
      return this.handleIfLast(appendRide)(rides)(additionalRide);
    }

    if (isGoingUp(additionalRide)) {
      if (currentRide.from === additionalRide.from) {
        if (additionalRide.to === currentRide.to) {
          /* [4]
           * -----> currentRide
           * -----> additionalRide
           */
          return this.handleWithLimitedCapacity(mergeIdenticalRides)(rides)(additionalRide);
        }
        if (additionalRide.to < currentRide.to) {
          /* [5]
           * ----------> currentRide
           * -----> additionalRide
           */
          return this.handleWithLimitedCapacity(mergeRidesWithSameOrigin)(rides)(additionalRide);
        }
        /* [6]
         * -----> currentRide
         * ----------> additionalRide
         */
        return this.handleBinaryOverflowAndLimitedCapacity(mergeRidesWithSameOrigin)(rides)(additionalRide);
      }

      if (currentRide.from < additionalRide.from) {
        if (currentRide.to === additionalRide.to) {
          /* [7]
           * ----------> currentRide
           *      -----> additionalRide
           */
          return this.handleWithLimitedCapacity(mergeRidesWithSameDestination)(rides)(additionalRide);
        }
        if (currentRide.to < additionalRide.to) {
          /* [8]
           * ----------> currentRide
           *      ----------> additionalRide
           */
          return this.handleTernaryOverflowAndLimitedCapacity(mergeOverlappingRides)(rides)(additionalRide);
        }
        /* [9]
         * ---------------> currentRide
         *      -----> additionalRide
         */
        return this.handleWithLimitedCapacity(mergeRidesOneIncludingTheOther)(rides)(additionalRide);
      }
    }

    /* [10]
     *     -----> currentRide
     * <----- additionalRide
     */
    return this.handleIfLast(appendRide)(rides)(additionalRide);
  };

  private handle = (fn: HandleFunction) => (rides: Ride[]) => (additionalRide: Ride): Ride[] => {
    const [currentRide, ...remainingRides] = rides;
    return [...fn(currentRide, additionalRide), ...remainingRides];
  };

  private delegate = (rides: Ride[]) => (additionalRide: Ride): Ride[] => {
    const [currentRide, ...remainingRides] = rides;
    return [currentRide, ...this.mergeRecursively(remainingRides, additionalRide)];
  };

  private handleIfLast = (fn: HandleFunction) => (rides: Ride[]) => (additionalRide: Ride): Ride[] => {
    const [_currentRide, ...remainingRides] = rides;
    if (isEmpty(remainingRides)) {
      return this.handle(fn)(rides)(additionalRide);
    }
    return this.delegate(rides)(additionalRide);
  };

  private handleWithLimitedCapacity = (fn: HandleFunction) => (rides: Ride[]) => (additionalRide: Ride): Ride[] => {
    const proceed = () => this.handle(fn)(rides)(additionalRide);
    return this.withLimitedCapacity(proceed)(rides)(additionalRide);
  };

  private handleBinaryOverflowAndLimitedCapacity = (fn: BinaryHandleFunction) => (rides: Ride[]) => (
    additionalRide: Ride
  ): Ride[] => {
    const proceed = () => {
      const [currentRide, ...remainingRides] = rides;

      if (isEmpty(remainingRides)) {
        return fn(currentRide, additionalRide);
      }

      const [first, second] = fn(currentRide, additionalRide);

      const nextMergeResult = this.mergeRecursively(remainingRides, second);

      if (contains(nextMergeResult)(second)) {
        return [first, ...nextMergeResult];
      }
      return this.delegate(rides)(additionalRide);
    };

    return this.withLimitedCapacity(proceed)(rides)(additionalRide);
  };

  private handleTernaryOverflowAndLimitedCapacity = (fn: TernaryHandleFunction) => (rides: Ride[]) => (
    additionalRide: Ride
  ): Ride[] => {
    const proceed = () => {
      const [currentRide, ...remainingRides] = rides;

      if (isEmpty(remainingRides)) {
        return fn(currentRide, additionalRide);
      }

      const [first, second, third] = fn(currentRide, additionalRide);

      const nextMergeResult = this.mergeRecursively(remainingRides, third);

      if (contains(nextMergeResult)(third)) {
        return [first, second, ...nextMergeResult];
      }
      return this.delegate(rides)(additionalRide);
    };

    return this.withLimitedCapacity(proceed)(rides)(additionalRide);
  };

  private withLimitedCapacity = (proceed: () => Ride[]) => (rides: Ride[]) => (additionalRide: Ride): Ride[] => {
    const [currentRide, ...remainingRides] = rides;

    if (this.satisfiesLimitedCapacity(currentRide, additionalRide)) {
      return proceed();
    }

    if (isEmpty(remainingRides)) {
      return appendRide(currentRide, additionalRide);
    }

    return this.delegate(rides)(additionalRide);
  };

  private satisfiesLimitedCapacity = (currentRide: Ride, additionalRide: Ride): boolean => {
    return currentRide.persons + additionalRide.persons <= this.capacity;
  };
}

function isGoingUp({ from, to }: Ride): boolean {
  return from < to;
}

function computeSymetricalRide({ from, to, persons }: Ride): Ride {
  return {
    from: -from,
    to: -to,
    persons,
  };
}

function appendFirstRideFromActualFloor(additionalRide: Ride): [Ride] {
  return [additionalRide];
}

function appendFirstRide(from: Floor, additionalRide: Ride): [Ride, Ride] {
  return [
    {
      from,
      to: additionalRide.from,
      persons: 0,
    },
    additionalRide,
  ];
}

const appendAdjacentRide: BinaryHandleFunction = (currentRide, additionalRide) => {
  return [currentRide, ...appendFirstRideFromActualFloor(additionalRide)];
};

const appendRide: TernaryHandleFunction = (currentRide, additionalRide) => {
  return [currentRide, ...appendFirstRide(currentRide.to, additionalRide)];
};

const mergeIdenticalRides: UnaryHandleFunction = (currentRide, additionalRide) => {
  return [
    {
      ...currentRide,
      persons: currentRide.persons + additionalRide.persons,
    },
  ];
};

const mergeRidesWithSameOrigin: BinaryHandleFunction = (currentRide, additionalRide) => {
  return [
    {
      from: currentRide.from,
      to: Math.min(additionalRide.to, currentRide.to),
      persons: currentRide.persons + additionalRide.persons,
    },
    {
      from: Math.min(additionalRide.to, currentRide.to),
      to: Math.max(additionalRide.to, currentRide.to),
      persons: currentRide.persons,
    },
  ];
};

const mergeRidesWithSameDestination: BinaryHandleFunction = (currentRide, additionalRide) => {
  return [
    {
      from: currentRide.from,
      to: additionalRide.from,
      persons: currentRide.persons,
    },
    {
      from: additionalRide.from,
      to: currentRide.to,
      persons: currentRide.persons + additionalRide.persons,
    },
  ];
};

const mergeRidesOneIncludingTheOther: TernaryHandleFunction = (currentRide, additionalRide) => {
  return [
    {
      from: currentRide.from,
      to: additionalRide.from,
      persons: currentRide.persons,
    },
    {
      ...additionalRide,
      persons: currentRide.persons + additionalRide.persons,
    },
    {
      from: additionalRide.to,
      to: currentRide.to,
      persons: currentRide.persons,
    },
  ];
};

const mergeOverlappingRides: TernaryHandleFunction = (currentRide, additionalRide) => {
  return [
    {
      from: currentRide.from,
      to: additionalRide.from,
      persons: currentRide.persons,
    },
    {
      from: additionalRide.from,
      to: currentRide.to,
      persons: currentRide.persons + additionalRide.persons,
    },
    {
      from: currentRide.to,
      to: additionalRide.to,
      persons: additionalRide.persons,
    },
  ];
};

function ridesAreSimilar(ride1: Ride, ride2: Ride): boolean {
  // The person attribute is ignored, on purpose. Similarity, not equality.
  return ride1.from === ride2.from && ride1.to === ride2.to;
}

export const contains = (rides: Ride[]) => (ride: Ride): boolean => {
  if (isEmpty(rides)) {
    return false;
  }

  if (rides.length === 1) {
    const [firstRide] = rides;
    return ridesAreSimilar(firstRide, ride) && ride.persons <= firstRide.persons;
  }

  const [firstRide, secondRide, ...remainingRides] = rides;

  const combinedRides: Ride = {
    from: firstRide.from,
    to: secondRide.to,
    persons: Math.min(firstRide.persons, secondRide.persons),
  };

  return contains([firstRide])(ride) || contains([combinedRides, ...remainingRides])(ride);
};
