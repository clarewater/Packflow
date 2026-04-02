import { businessTripPackingScenarioMock } from './business-trip-packing';
import { datePackingScenarioMock } from './date-packing';
import { gymPackingScenarioMock } from './gym-packing';
import { hotelPackingScenarioMock } from './hotel-packing';
import { travelPackingScenarioMock } from './travel-packing';

export * from './business-trip-packing';
export * from './date-packing';
export * from './gym-packing';
export * from './hotel-packing';
export * from './travel-packing';

export const packingScenarioMocks = [
  hotelPackingScenarioMock,
  datePackingScenarioMock,
  travelPackingScenarioMock,
  businessTripPackingScenarioMock,
  gymPackingScenarioMock,
];
