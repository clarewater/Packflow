import { businessTripPackingScenarioMock } from './business-trip-packing';
import { concertPackingScenarioMock } from './concert-packing';
import { examPackingScenarioMock } from './exam-packing';
import { travelPackingScenarioMock } from './travel-packing';

export * from './business-trip-packing';
export * from './concert-packing';
export * from './exam-packing';
export * from './travel-packing';

export const packingScenarioMocks = [
  examPackingScenarioMock,
  businessTripPackingScenarioMock,
  travelPackingScenarioMock,
  concertPackingScenarioMock,
];
