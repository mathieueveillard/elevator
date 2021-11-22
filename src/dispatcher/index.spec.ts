import { Dispatcher } from ".";

describe("Dispatcher", function () {
  test("A dispatcher with 1 elevator", function () {
    const dispatcher = Dispatcher.create({ numberOfElevators: 1, capacityOfAnElevator: 10 }); // Given
    expect(dispatcher.request({ from: 0, to: 1 })).toEqual("A"); // When + Then
  });

  test("A dispatcher with 2 elevators; it should delegate the request to the elevator with the lowest number of rides", function () {
    const dispatcher = Dispatcher.create({ numberOfElevators: 2, capacityOfAnElevator: 10 });
    dispatcher.request({ from: 0, to: 1 }); // Given
    expect(dispatcher.request({ from: 0, to: 1 })).toEqual("B"); // When + Then
  });

  test("A dispatcher with 2 elevators; it should delegate the request to the elevator with the lowest number of rides", function () {
    const dispatcher = Dispatcher.create({ numberOfElevators: 2, capacityOfAnElevator: 10 }); // Given
    expect(dispatcher.request({ from: 0, to: 1 })).toEqual("A"); // When + Then
  });

  test("A dispatcher with 2 elevators; if the 2 elevators have the same number of rides, it should delegate the request to the elevator which will be the closest in the end", function () {
    const dispatcher = Dispatcher.create({ numberOfElevators: 2, capacityOfAnElevator: 10 });
    dispatcher.request({ from: 0, to: 2 });
    dispatcher.request({ from: 0, to: 1 }); // Given
    expect(dispatcher.request({ from: 0, to: 1 })).toEqual("B"); // When + Then
  });
});
