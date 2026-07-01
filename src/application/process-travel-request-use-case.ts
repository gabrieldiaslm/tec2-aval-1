// src/application/process-travel-request-use-case.ts

import { TravelRequest, TravelRequestInput, TravelRequestOutput } from '../domain/travel-request';
import { TravelRequestRepository } from './travel-request-repository';

export class ProcessTravelRequestUseCase {
  private repository: TravelRequestRepository;

  // Injects the repository dependency through the constructor
  constructor(repository: TravelRequestRepository) {
    this.repository = repository;
  }

  // Executes the workflow: validate/calculate -> save -> return
  public async execute(input: TravelRequestInput): Promise<TravelRequestOutput> {
    // 1. Domain logic handles all rules, validations, and calculations
    const travelRequest = new TravelRequest(input);
    const output = travelRequest.analyze();

    // 2. Infrastructure (abstracted by the interface) handles persistence
    // We await the save operation before returning
    await this.repository.save(output);

    // 3. Return the exact format expected by the public contract
    return output;
  }
}