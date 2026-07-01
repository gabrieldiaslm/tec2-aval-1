// tests/infra/pg-travel-request-repository.test.ts

import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { PgTravelRequestRepository } from '../../src/infra/pg-travel-request-repository';
import { TravelRequestInput, TravelRequestOutput } from '../../src/domain/travel-request';
import { Pool } from 'pg';

describe('PgTravelRequestRepository Rigorous Integration Tests', () => {
  let repository: PgTravelRequestRepository;
  let pool: Pool;

  beforeAll(() => {
    // Fallback for local testing if DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/travel_requests";
    }
    repository = new PgTravelRequestRepository();
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  });

  afterAll(async () => {
    await repository.disconnect();
    await pool.end();
  });

  test('should insert a new travel request successfully', async () => {
    const input: TravelRequestInput = {
      requestId: "req-infra-rigorous-001",
      requesterName: "Eyder Rios",
      requesterType: "professor",
      destination: "Parnaíba",
      departureDate: "2026-08-01",
      returnDate: "2026-08-05",
      reason: "Initial submission",
      transportCostInCents: 10000
    };

    const output: TravelRequestOutput = {
      requestId: "req-infra-rigorous-001",
      status: "approved",
      travelDays: 5,
      dailyAmountInCents: 25000,
      subtotalInCents: 125000,
      totalAmountInCents: 135000,
      errors: [],
      warnings: []
    };

    // Act
    await repository.save(input, output);

    // Assert by querying the database directly
    const result = await pool.query('SELECT * FROM travel_requests WHERE id = $1', ['req-infra-rigorous-001']);
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].reason).toBe("Initial submission");
    expect(result.rows[0].status).toBe("approved");
  });

  test('should update an existing travel request successfully (ON CONFLICT)', async () => {
    // Re-using the same ID from the previous test to trigger ON CONFLICT
    const updatedInput: TravelRequestInput = {
      requestId: "req-infra-rigorous-001", // Exact same ID
      requesterName: "Eyder Rios",
      requesterType: "professor",
      destination: "Parnaíba",
      departureDate: "2026-08-01",
      returnDate: "2026-08-06", // Changed date (now 6 days)
      reason: "Updated submission with more details.",
      transportCostInCents: 10000
    };

    const updatedOutput: TravelRequestOutput = {
      requestId: "req-infra-rigorous-001",
      status: "pending-review", // Changed status due to > 5 days rule
      travelDays: 6,
      dailyAmountInCents: 25000,
      subtotalInCents: 150000,
      totalAmountInCents: 160000,
      errors: [],
      warnings: []
    };

    // Act - Saving again with the same ID should trigger the UPDATE
    await repository.save(updatedInput, updatedOutput);

    // Assert
    const result = await pool.query('SELECT * FROM travel_requests WHERE id = $1', ['req-infra-rigorous-001']);
    
    // Should still be exactly 1 row (no duplication), but with updated values
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].reason).toBe("Updated submission with more details.");
    expect(result.rows[0].status).toBe("pending-review");
    expect(result.rows[0].travel_days).toBe(6);
    expect(result.rows[0].total_amount_in_cents).toBe(160000);
  });
});