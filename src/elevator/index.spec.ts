import { contains, Elevator, Ride } from ".";

function elevatorAtFloorN(capacity: number, n: number): Elevator {
  let elevator = Elevator.create({ capacity }).request({ from: 0, to: n });
  for (let i = 0; i < n; i++) {
    elevator = elevator.tick();
  }
  return elevator;
}

describe("Elevator", function () {
  describe("Time simulation", function () {
    test("An elevator should start at floor 0", function () {
      const elevator = Elevator.create({ capacity: 10 });
      expect(elevator.floor).toEqual(0);
    });

    test("An elevator should NOT move if there is no ride", function () {
      const elevator = Elevator.create({ capacity: 10 }) // Given
        .tick(); // When
      expect(elevator.floor).toEqual(0);
    });

    test("An elevator should move according to its next ride if there is one (up)", function () {
      const elevator = Elevator.create({ capacity: 10 })
        .request({ from: 0, to: 2 }) // Given
        .tick(); // When
      expect(elevator.floor).toEqual(1);
    });

    test("An elevator should move according to its next ride if there is one (up)", function () {
      const elevator = Elevator.create({ capacity: 10 })
        .request({ from: 0, to: 2 }) // Given
        .tick() // When
        .tick();
      expect(elevator.floor).toEqual(2);
    });

    test("An elevator should move according to its next ride if there is one (up)", function () {
      const elevator = Elevator.create({ capacity: 10 })
        .request({ from: 0, to: 2 }) // Given
        .tick() // When
        .tick()
        .tick();
      expect(elevator.floor).toEqual(2);
    });

    test("An elevator should move according to its next ride if there is one (down)", function () {
      const elevator = elevatorAtFloorN(10, 2)
        .request({ from: 2, to: 0 }) // Given
        .tick(); // When
      expect(elevator.floor).toEqual(1);
    });

    test("An elevator should move according to its next ride if there is one (down)", function () {
      const elevator = elevatorAtFloorN(10, 2)
        .request({ from: 2, to: 0 }) // Given
        .tick() // When
        .tick();
      expect(elevator.floor).toEqual(0);
    });

    test("An elevator should move according to its next ride if there is one (down)", function () {
      const elevator = elevatorAtFloorN(10, 2)
        .request({ from: 2, to: 0 }) // Given
        .tick() // When
        .tick()
        .tick();
      expect(elevator.floor).toEqual(0);
    });
  });

  describe("Request processing", function () {
    test("1 N/A ride", function () {
      const elevator = Elevator.create({ capacity: 10 }).request({
        from: 1,
        to: 1,
      });
      expect(elevator.rides).toEqual([]);
    });

    describe("No prior ride", function () {
      test("From lobby", function () {
        const elevator = Elevator.create({ capacity: 10 }).request({ from: 0, to: 1 });
        expect(elevator.rides).toEqual([{ from: 0, to: 1, persons: 1 }]);
      });

      test("From another floor", function () {
        const elevator = Elevator.create({ capacity: 10 }).request({
          from: 1,
          to: 2,
        });
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 0 },
          { from: 1, to: 2, persons: 1 },
        ]);
      });
    });

    describe("One prior ride", function () {
      describe("Elevator is going up", function () {
        test("Case 1 (additionalRide going up)", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: 2, to: 3 });
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: 2, persons: 0 },
            { from: 2, to: 3, persons: 1 },
          ]);
        });

        test("Case 1 (additionalRide going down)", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: 2, to: 0 });
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: 2, persons: 0 },
            { from: 2, to: 0, persons: 1 },
          ]);
        });

        test("Case 2 (additionalRide going up)", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: 1, to: 2 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: 2, persons: 1 },
          ]);
        });

        test("Case 2 (additionalRide going down)", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: 1, to: 0 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: 0, persons: 1 },
          ]);
        });

        test("Case 3 (additionalRide going up)", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: -1, to: 0 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: -1, persons: 0 },
            { from: -1, to: 0, persons: 1 },
          ]);
        });

        test("Case 3 (additionalRide going down)", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: -1, to: -2 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: -1, persons: 0 },
            { from: -1, to: -2, persons: 1 },
          ]);
        });

        test("Case 4", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: 0, to: 1 }); // When
          expect(elevator.rides).toEqual([{ from: 0, to: 1, persons: 2 }]);
        });

        test("Case 5", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 2 }) // Given
            .request({ from: 0, to: 1 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 2 },
            { from: 1, to: 2, persons: 1 },
          ]);
        });

        test("Case 6", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 1 }) // Given
            .request({ from: 0, to: 2 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 2 },
            { from: 1, to: 2, persons: 1 },
          ]);
        });

        test("Case 7", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 2 }) // Given
            .request({ from: 1, to: 2 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: 2, persons: 2 },
          ]);
        });

        test("Case 8", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 2 }) // Given
            .request({ from: 1, to: 3 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: 2, persons: 2 },
            { from: 2, to: 3, persons: 1 },
          ]);
        });

        test("Case 9", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 3 }) // Given
            .request({ from: 1, to: 2 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 1, persons: 1 },
            { from: 1, to: 2, persons: 2 },
            { from: 2, to: 3, persons: 1 },
          ]);
        });

        test("Case 10", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: 2 }) // Given
            .request({ from: 1, to: 0 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: 2, persons: 1 },
            { from: 2, to: 1, persons: 0 },
            { from: 1, to: 0, persons: 1 },
          ]);
        });
      });

      describe("Elevator is going down", function () {
        test("Case 1", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: -1 }) // Given
            .request({ from: -2, to: -3 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: -1, persons: 1 },
            { from: -1, to: -2, persons: 0 },
            { from: -2, to: -3, persons: 1 },
          ]);
        });

        test("[control] Case 5", function () {
          const elevator = Elevator.create({ capacity: 10 }) //
            .request({ from: 0, to: -2 }) // Given
            .request({ from: 0, to: -1 }); // When
          expect(elevator.rides).toEqual([
            { from: 0, to: -1, persons: 2 },
            { from: -1, to: -2, persons: 1 },
          ]);
        });
      });
    });

    describe("Many prior rides", function () {
      test("Case 1: delegate", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 1 })
          .request({ from: 2, to: 3 }) // Given
          .request({ from: 2, to: 3 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 0 },
          { from: 2, to: 3, persons: 2 },
        ]);
      });

      test("Case 2: delegate", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 1 })
          .request({ from: 1, to: 2 }) // Given
          .request({ from: 1, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 2 },
        ]);
      });

      test("Case 3: delegate", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 1 })
          .request({ from: 1, to: 2 }) // Given
          .request({ from: -1, to: 0 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 1 },
          { from: 2, to: -1, persons: 0 },
          { from: -1, to: 0, persons: 1 },
        ]);
      });

      test("Case 4: handle", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 1 })
          .request({ from: 1, to: 2 }) // Given
          .request({ from: 0, to: 1 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 2 },
          { from: 1, to: 2, persons: 1 },
        ]);
      });

      test("Case 5: handle", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 1 })
          .request({ from: 3, to: 4 }) // Given
          .request({ from: 1, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 1 },
          { from: 2, to: 3, persons: 0 },
          { from: 3, to: 4, persons: 1 },
        ]);
      });

      test("Case 7: handle", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 2 })
          .request({ from: 2, to: 3 }) // Given
          .request({ from: 1, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 2 },
          { from: 2, to: 3, persons: 1 },
        ]);
      });

      test("Case 8: handle", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 2 })
          .request({ from: 2, to: 4 }) // Given
          .request({ from: 1, to: 3 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 2 },
          { from: 2, to: 3, persons: 2 },
          { from: 3, to: 4, persons: 1 },
        ]);
      });

      test("Case 8: delegate", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 2 })
          .request({ from: 1, to: 0 }) // Given
          .request({ from: 1, to: 3 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 2, persons: 1 },
          { from: 2, to: 1, persons: 0 },
          { from: 1, to: 0, persons: 1 },
          { from: 0, to: 1, persons: 0 },
          { from: 1, to: 3, persons: 1 },
        ]);
      });

      test("Case 8: handle", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 2 })
          .request({ from: 2, to: 3 })
          .request({ from: 3, to: 4 })
          .request({ from: 1, to: 0 }) // Given
          .request({ from: 1, to: 4 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 2 },
          { from: 2, to: 3, persons: 2 },
          { from: 3, to: 4, persons: 2 },
          { from: 4, to: 1, persons: 0 },
          { from: 1, to: 0, persons: 1 },
        ]);
      });

      test("Case 6: delegate", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 1 })
          .request({ from: 1, to: 0 }) // Given
          .request({ from: 0, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 0, persons: 1 },
          { from: 0, to: 2, persons: 1 },
        ]);
      });

      test("Case 9: handle", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 3 })
          .request({ from: 3, to: 4 }) // Given
          .request({ from: 1, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 2 },
          { from: 2, to: 3, persons: 1 },
          { from: 3, to: 4, persons: 1 },
        ]);
      });

      test("Case 10: delegate", function () {
        const elevator = Elevator.create({ capacity: 10 })
          .request({ from: 0, to: 2 })
          .request({ from: 2, to: 3 }) // Given
          .request({ from: 1, to: -1 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 2, persons: 1 },
          { from: 2, to: 3, persons: 1 },
          { from: 3, to: 1, persons: 0 },
          { from: 1, to: -1, persons: 1 },
        ]);
      });
    });

    describe("With limited capacity", function () {
      test("Case 4", function () {
        const elevator = Elevator.create({ capacity: 1 }) //
          .request({ from: 0, to: 1 }) // Given
          .request({ from: 0, to: 1 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 0, persons: 0 },
          { from: 0, to: 1, persons: 1 },
        ]);
      });

      test("Case 5", function () {
        const elevator = Elevator.create({ capacity: 1 }) //
          .request({ from: 0, to: 2 }) // Given
          .request({ from: 0, to: 1 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 2, persons: 1 },
          { from: 2, to: 0, persons: 0 },
          { from: 0, to: 1, persons: 1 },
        ]);
      });

      test("Case 6", function () {
        const elevator = Elevator.create({ capacity: 1 }) //
          .request({ from: 0, to: 1 }) // Given
          .request({ from: 0, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 0, persons: 0 },
          { from: 0, to: 2, persons: 1 },
        ]);
      });

      test("Case 7", function () {
        const elevator = Elevator.create({ capacity: 1 }) //
          .request({ from: 0, to: 2 }) // Given
          .request({ from: 1, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 2, persons: 1 },
          { from: 2, to: 1, persons: 0 },
          { from: 1, to: 2, persons: 1 },
        ]);
      });

      test("Case 8", function () {
        const elevator = Elevator.create({ capacity: 1 }) //
          .request({ from: 0, to: 2 }) // Given
          .request({ from: 1, to: 3 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 2, persons: 1 },
          { from: 2, to: 1, persons: 0 },
          { from: 1, to: 3, persons: 1 },
        ]);
      });

      test("Case 9", function () {
        const elevator = Elevator.create({ capacity: 1 }) //
          .request({ from: 0, to: 3 }) // Given
          .request({ from: 1, to: 2 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 3, persons: 1 },
          { from: 3, to: 1, persons: 0 },
          { from: 1, to: 2, persons: 1 },
        ]);
      });

      test("With limited capacity and delegates", function () {
        const elevator = Elevator.create({ capacity: 1 }) //
          .request({ from: 0, to: 1 })
          .request({ from: 1, to: 2 }) // Given
          .request({ from: 0, to: 1 }); // When
        expect(elevator.rides).toEqual([
          { from: 0, to: 1, persons: 1 },
          { from: 1, to: 2, persons: 1 },
          { from: 2, to: 0, persons: 0 },
          { from: 0, to: 1, persons: 1 },
        ]);
      });
    });
  });

  describe("contains", function () {
    test("No prior rides", function () {
      const rides: Ride[] = [];
      const ride: Ride = { from: 0, to: 1, persons: 1 };
      expect(contains(rides)(ride)).toEqual(false);
    });

    test("One similar prior ride", function () {
      const rides: Ride[] = [{ from: 0, to: 1, persons: 1 }];
      const ride: Ride = { from: 0, to: 1, persons: 1 };
      expect(contains(rides)(ride)).toEqual(true);
    });

    test("One bigger prior ride", function () {
      const rides: Ride[] = [{ from: 0, to: 2, persons: 1 }];
      const ride: Ride = { from: 0, to: 1, persons: 1 };
      expect(contains(rides)(ride)).toEqual(false);
    });

    test("Limitation by the number of persons", function () {
      const rides: Ride[] = [{ from: 0, to: 1, persons: 1 }];
      const ride: Ride = { from: 0, to: 1, persons: 2 };
      expect(contains(rides)(ride)).toEqual(false);
    });

    test("Many prior rides", function () {
      const rides: Ride[] = [
        { from: 0, to: 1, persons: 1 },
        { from: 1, to: 2, persons: 1 },
      ];
      const ride: Ride = { from: 0, to: 2, persons: 1 };
      expect(contains(rides)(ride)).toEqual(true);
    });
  });

  describe("elevatorAtFloorN()", function () {
    test("should allow to set the level of an elevator", function () {
      expect(elevatorAtFloorN(10, 2).floor).toEqual(2);
    });
  });
});
