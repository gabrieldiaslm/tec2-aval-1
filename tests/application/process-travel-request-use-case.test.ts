// tests/application/process-travel-request-use-case.test.ts

import { expect, test, describe, vi } from 'vitest';
import { ProcessTravelRequestUseCase } from '../../src/application/process-travel-request-use-case';
import { TravelRequestRepository } from '../../src/application/travel-request-repository';
import { TravelRequestInput } from '../../src/domain/travel-request';

describe('ProcessTravelRequestUseCase Application Service', () => {
  test('should orchestrate the analysis and save it to the repository', async () => {
    // 1. Create a Mock Repository (Simulating infrastructure)
    const mockRepository: TravelRequestRepository = {
      save: vi.fn().mockResolvedValue(undefined)
    };

    // 2. Instantiate the Use Case injecting the Mock
    const useCase = new ProcessTravelRequestUseCase(mockRepository);

    // 3. Prepare the input data
    const input: TravelRequestInput = {
      requestId: "req-app-001",
      requesterName: "Eyder Rios",
      requesterType: "student",
      destination: "Parnaíba",
      departureDate: "2026-07-01",
      returnDate: "2026-07-03", 
      reason: "Conference",
      transportCostInCents: 5000 
    };

    // 4. Execute the Use Case
    const result = await useCase.execute(input);

    // 5. Assertions
    expect(result.status).toBe("approved");
    
    // Verify if the repository save method was called exactly once
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    
    // Verify if the repository save method was called with the correct Domain output
    expect(mockRepository.save).toHaveBeenCalledWith(result);
  });
});