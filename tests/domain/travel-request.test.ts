// tests/domain/travel-request.test.ts

import { expect, test, describe } from 'vitest';
import { TravelRequest, TravelRequestInput } from '../../src/domain/travel-request';

describe('TravelRequest Domain - Rigorous Edge Cases & Boundaries', () => {

  // 1. Boundary Test: Exactly 5 days vs 6 days
  test('should approve exactly 5 travel days (boundary)', () => {
    const input: TravelRequestInput = {
      requestId: "edge-001",
      requesterName: "Eyder Rios",
      requesterType: "student",
      destination: "Parnaíba",
      departureDate: "2026-07-01",
      returnDate: "2026-07-05", // 1 to 5 = 5 days exactly
      reason: "Short trip",
      transportCostInCents: 1000
    };
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.travelDays).toBe(5);
    expect(result.status).toBe("approved"); // <= 5 days remains approved [cite: 86, 88]
    expect(result.warnings).toHaveLength(0);
  });

  test('should mark as pending-review exactly 6 travel days (boundary)', () => {
    const input: TravelRequestInput = {
      ...getValidBaseInput(),
      returnDate: "2026-07-06", // 1 to 6 = 6 days exactly
      reason: "Detailed reason with more than thirty characters."
    };
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.travelDays).toBe(6);
    expect(result.status).toBe("pending-review"); // > 5 days [cite: 86]
  });

  // 2. Boundary Test: Exactly R$ 2.000,00 vs R$ 2.000,01
  test('should approve if total amount is exactly 200000 cents', () => {
    const input: TravelRequestInput = {
      ...getValidBaseInput(),
      requesterType: "manager", // 30000 per day [cite: 82]
      returnDate: "2026-07-04", // 4 days * 30000 = 120000
      transportCostInCents: 80000 // 120000 + 80000 = 200000 exactly
    };
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.totalAmountInCents).toBe(200000);
    expect(result.status).toBe("approved"); // Not strictly superior to 200000 [cite: 87, 88]
  });

  test('should mark as pending-review if total amount is 200001 cents', () => {
    const input: TravelRequestInput = {
      ...getValidBaseInput(),
      requesterType: "manager",
      returnDate: "2026-07-04", 
      transportCostInCents: 80001 // Total = 200001
    };
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.totalAmountInCents).toBe(200001);
    expect(result.status).toBe("pending-review"); // > 200000 [cite: 87]
  });

  // 3. Boundary Test: Warning reason length (29 vs 30 chars)
  test('should add warning if travel is > 5 days and reason is exactly 29 characters', () => {
    const input: TravelRequestInput = {
      ...getValidBaseInput(),
      returnDate: "2026-07-06", // 6 days
      reason: "12345678901234567890123456789" // 29 characters
    };
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.warnings).toContain("long travel requests should include a detailed reason"); 
  });

  test('should NOT add warning if travel is > 5 days and reason is exactly 30 characters', () => {
    const input: TravelRequestInput = {
      ...getValidBaseInput(),
      returnDate: "2026-07-06", 
      reason: "123456789012345678901234567890" // 30 characters
    };
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.warnings).toHaveLength(0); 
  });

  // 4. Invalid Dates Edge Cases (Leap years, non-existent dates)
  test('should reject non-existent calendar dates even if format matches', () => {
    const input: TravelRequestInput = {
      ...getValidBaseInput(),
      departureDate: "2026-02-30", // Feb 30th does not exist
      returnDate: "2026-13-01"     // Month 13 does not exist
    };
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.status).toBe("rejected"); 
    expect(result.errors).toContain("departureDate must be a valid YYYY-MM-DD date"); 
    expect(result.errors).toContain("returnDate must be a valid YYYY-MM-DD date"); 
  });

  // 5. Accumulation of errors
  test('should accumulate all missing required field errors simultaneously', () => {
    const input = {
      requestId: "",
      requesterName: "",
      requesterType: "",
      destination: "",
      departureDate: "",
      returnDate: ""
    } as TravelRequestInput;
    const request = new TravelRequest(input);
    const result = request.analyze();
    
    expect(result.status).toBe("rejected"); 
    expect(result.errors).toHaveLength(6);
    expect(result.errors).toContain("requestId is required"); 
    expect(result.errors).toContain("destination is required"); 
  });

});

// Helper function to keep tests clean and focused only on what changes
function getValidBaseInput(): TravelRequestInput {
  return {
    requestId: "base-001",
    requesterName: "John Doe",
    requesterType: "employee",
    destination: "Teresina",
    departureDate: "2026-07-01",
    returnDate: "2026-07-02",
    reason: "Standard valid reason used for testing.",
    transportCostInCents: 10000
  };
}