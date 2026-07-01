import { expect, test, describe } from 'vitest';
import { TravelRequest, TravelRequestInput } from '../../src/domain/travel-request';

describe('TravelRequest Domain Entity', () => {
  
  test('should approve a valid short trip for a student', () => {
    const input: TravelRequestInput = {
      requestId: "req-123",
      requesterName: "Gabriel Dias",
      requesterType: "student",
      destination: "Parnaíba",
      departureDate: "2026-07-01",
      returnDate: "2026-07-03", // 3 inclusive days
      reason: "Conference",
      transportCostInCents: 5000 
    };

    const request = new TravelRequest(input);
    const result = request.analyze();

    expect(result.status).toBe("approved");
    expect(result.travelDays).toBe(3);
    expect(result.dailyAmountInCents).toBe(9000);
    expect(result.subtotalInCents).toBe(27000); 
    expect(result.totalAmountInCents).toBe(32000); 
    expect(result.errors).toHaveLength(0);
  });

  test('should reject if returnDate is before departureDate', () => {
    const input = {
      requestId: "req-124",
      requesterName: "John Doe",
      requesterType: "manager",
      destination: "Teresina",
      departureDate: "2026-07-10",
      returnDate: "2026-07-05", // Invalid date!
      reason: "Meeting",
      transportCostInCents: 10000
    } as TravelRequestInput;

    const request = new TravelRequest(input);
    const result = request.analyze();

    expect(result.status).toBe("rejected");
    expect(result.errors).toContain("returnDate cannot be before departureDate");
  });
});