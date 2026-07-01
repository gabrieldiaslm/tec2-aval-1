// tests/application/process-travel-request-use-case.test.ts

import { expect, test, describe, vi, beforeEach } from 'vitest';
import { ProcessTravelRequestUseCase } from '../../src/application/process-travel-request-use-case';
import { TravelRequestRepository } from '../../src/application/travel-request-repository';
import { TravelRequestInput } from '../../src/domain/travel-request';

describe('ProcessTravelRequestUseCase - Rigorous Application Tests', () => {
  let mockRepository: TravelRequestRepository;
  let useCase: ProcessTravelRequestUseCase;

  // We use beforeEach to guarantee that every test starts with a clean state,
  // preventing mock calls from one test leaking into another.
  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined)
    };
    useCase = new ProcessTravelRequestUseCase(mockRepository);
  });

  test('should orchestrate a successful travel request and call repository with input and output', async () => {
    const input: TravelRequestInput = {
      requestId: "app-rigorous-001",
      requesterName: "Eyder Rios",
      requesterType: "student",
      destination: "Parnaíba",
      departureDate: "2026-07-01",
      returnDate: "2026-07-03", 
      reason: "Conference",
      transportCostInCents: 5000 
    };

    const result = await useCase.execute(input);

    expect(result.status).toBe("approved");
    
    // Crucial orchestration checks
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(input, result);
  });

  test('should orchestrate a rejected request (domain logic) and save the failed attempt as an audit log', async () => {
    // Input missing several required fields
    const invalidInput = {
      requestId: "app-rigorous-002",
      requesterName: "",
      requesterType: "student",
      destination: "",
      departureDate: "2026-07-01",
      returnDate: "2026-06-01", // Invalid: return before departure
      reason: "",
      transportCostInCents: 0
    } as TravelRequestInput;

    const result = await useCase.execute(invalidInput);

    // The domain should have rejected it
    expect(result.status).toBe("rejected");
    expect(result.errors.length).toBeGreaterThan(0);
    
    // Even if rejected, the Use Case must call the repository to save the attempt
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(invalidInput, result);
  });

  test('should bubble up infrastructure exceptions if the repository fails', async () => {
    const input: TravelRequestInput = {
      requestId: "app-rigorous-003",
      requesterName: "Eyder Rios",
      requesterType: "student",
      destination: "Parnaíba",
      departureDate: "2026-07-01",
      returnDate: "2026-07-03",
      reason: "Conference",
      transportCostInCents: 5000 
    };
    
    // Simulating a critical database failure (e.g., connection lost)
    const dbError = new Error("Database connection lost or timeout");
    mockRepository.save = vi.fn().mockRejectedValue(dbError);

    // The Use Case must NOT swallow the error silently. 
    // It should bubble the promise rejection up to the caller (main.ts)
    await expect(useCase.execute(input)).rejects.toThrow("Database connection lost or timeout");
    
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});