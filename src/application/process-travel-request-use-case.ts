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

    await this.repository.save(input, output);

    return output;
  }
}