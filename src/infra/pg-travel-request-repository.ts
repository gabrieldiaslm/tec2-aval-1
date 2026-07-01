import { Pool } from 'pg';
import { TravelRequestRepository } from '../application/travel-request-repository';
import { TravelRequestInput, TravelRequestOutput } from '../domain/travel-request';

export class PgTravelRequestRepository implements TravelRequestRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // The interface in Phase 3 must be updated to receive the Input as well, 
  // since the database schema requires fields like requester_name and destination.
  public async save(input: TravelRequestInput, output: TravelRequestOutput): Promise<void> {
    
    // We don't save rejected requests if there are validation errors,
    // or you could choose to save them depending on the business rule.
    // Assuming we save all attempts:
    
    const createdAt = new Date().toISOString(); // Generating the required created_at field

    const query = `
      INSERT INTO travel_requests (
        id, requester_name, requester_type, destination,
        departure_date, return_date, reason, status,
        travel_days, daily_amount_in_cents, subtotal_in_cents,
        transport_cost_in_cents, total_amount_in_cents, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      ON CONFLICT (id) DO UPDATE SET
        requester_name = EXCLUDED.requester_name,
        requester_type = EXCLUDED.requester_type,
        destination = EXCLUDED.destination,
        departure_date = EXCLUDED.departure_date,
        return_date = EXCLUDED.return_date,
        reason = EXCLUDED.reason,
        status = EXCLUDED.status,
        travel_days = EXCLUDED.travel_days,
        daily_amount_in_cents = EXCLUDED.daily_amount_in_cents,
        subtotal_in_cents = EXCLUDED.subtotal_in_cents,
        transport_cost_in_cents = EXCLUDED.transport_cost_in_cents,
        total_amount_in_cents = EXCLUDED.total_amount_in_cents,
        created_at = EXCLUDED.created_at;
    `;

    const values = [
      output.requestId, // maps to 'id'
      input.requesterName,
      input.requesterType,
      input.destination,
      input.departureDate,
      input.returnDate,
      input.reason || "", // handles potential missing reason
      output.status,
      output.travelDays,
      output.dailyAmountInCents,
      output.subtotalInCents,
      input.transportCostInCents,
      output.totalAmountInCents,
      createdAt
    ];

    await this.pool.query(query, values);
  }

  public async disconnect(): Promise<void> {
    await this.pool.end();
  }
}