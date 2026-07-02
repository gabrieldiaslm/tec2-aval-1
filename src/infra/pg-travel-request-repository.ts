import { Pool } from 'pg';
import { TravelRequestRepository } from '../application/travel-request-repository';
import { TravelRequestInput, TravelRequestOutput } from '../domain/travel-request';

export class PgTravelRequestRepository implements TravelRequestRepository {
  private pool: Pool;

  constructor() {
    // Provide a default local connection string if the environment variable is missing during tests
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/travel_requests";
    
    this.pool = new Pool({
      connectionString,
    });
  }

  public async save(input: TravelRequestInput, output: TravelRequestOutput): Promise<void> {
    
    const createdAt = new Date().toISOString();

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
      output.requestId, 
      input.requesterName,
      input.requesterType,
      input.destination,
      input.departureDate,
      input.returnDate,
      input.reason || "", 
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