import { TravelRequestInput, TravelRequestOutput } from '../domain/travel-request';

export interface TravelRequestRepository {
  save(input: TravelRequestInput, output: TravelRequestOutput): Promise<void>;
}