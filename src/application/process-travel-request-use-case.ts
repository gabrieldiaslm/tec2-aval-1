// src/application/process-travel-request-use-case.ts

import { TravelRequest, TravelRequestInput, TravelRequestOutput } from '../domain/travel-request';
import { TravelRequestRepository } from './travel-request-repository';

export class ProcessTravelRequestUseCase {
  private repository: TravelRequestRepository;

  constructor(repository: TravelRequestRepository) {
    this.repository = repository;
  }

  public async execute(input: TravelRequestInput): Promise<TravelRequestOutput> {
    const travelRequest = new TravelRequest(input);
    const output = travelRequest.analyze();

    // Correção aqui: Passando o input e o output para o repositório
    await this.repository.save(input, output);

    return output;
  }
}