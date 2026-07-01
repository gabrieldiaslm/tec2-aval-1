// src/application/travel-request-repository.ts

import { TravelRequestOutput } from '../domain/travel-request';

export interface TravelRequestRepository {
  // Method to save the processed travel request analysis
  save(request: TravelRequestOutput): Promise<void>;
}