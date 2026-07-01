export type RequesterType = "student" | "employee" | "professor" | "manager";
export type TravelStatus = "approved" | "pending-review" | "rejected";

export interface TravelRequestInput {
  requestId: string;
  requesterName: string;
  requesterType: RequesterType;
  destination: string;
  departureDate: string;
  returnDate: string;
  reason: string;
  transportCostInCents: number;
}

export interface TravelRequestOutput {
  requestId: string;
  status: TravelStatus;
  travelDays: number;
  dailyAmountInCents: number;
  subtotalInCents: number;
  totalAmountInCents: number;
  errors: string[];
  warnings: string[];
}

export class TravelRequest {
  private input: TravelRequestInput;
  private errors: string[] = [];
  private warnings: string[] = [];

  // Mapping of daily rates in cents
  private static readonly DAILY_RATES: Record<RequesterType, number> = {
    student: 9000,     
    employee: 18000,   
    professor: 25000,  
    manager: 30000     
  };

  constructor(input: TravelRequestInput) {
    this.input = input;
  }

  public analyze(): TravelRequestOutput {
    this.validateRequiredFields();
    this.validateDates();

    if (this.errors.length > 0) {
      return this.buildRejectedResponse();
    }

    const travelDays = this.calculateTravelDays();
    const dailyAmountInCents = TravelRequest.DAILY_RATES[this.input.requesterType];
    const subtotalInCents = travelDays * dailyAmountInCents;
    const totalAmountInCents = subtotalInCents + this.input.transportCostInCents;

    this.checkWarnings(travelDays);
    const status = this.determineStatus(travelDays, totalAmountInCents);

    return {
      requestId: this.input.requestId,
      status,
      travelDays,
      dailyAmountInCents,
      subtotalInCents,
      totalAmountInCents,
      errors: [],
      warnings: this.warnings
    };
  }

  // --- Private Methods ---

  private validateRequiredFields(): void {
    if (!this.input.requestId) this.errors.push("requestId is required");
    if (!this.input.requesterName) this.errors.push("requesterName is required");
    if (!this.input.requesterType) this.errors.push("requesterType is required");
    if (!this.input.destination) this.errors.push("destination is required");
    if (!this.input.departureDate) this.errors.push("departureDate is required");
    if (!this.input.returnDate) this.errors.push("returnDate is required");
  }

  private validateDates(): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    const isValidDeparture = dateRegex.test(this.input.departureDate ?? "");
    const isValidReturn = dateRegex.test(this.input.returnDate ?? "");

    if (!isValidDeparture && this.input.departureDate) {
      this.errors.push("departureDate must be a valid YYYY-MM-DD date");
    }
    if (!isValidReturn && this.input.returnDate) {
      this.errors.push("returnDate must be a valid YYYY-MM-DD date");
    }

    if (isValidDeparture && isValidReturn) {
      if (new Date(this.input.returnDate) < new Date(this.input.departureDate)) {
        this.errors.push("returnDate cannot be before departureDate");
      }
    }
  }

  private calculateTravelDays(): number {
    const start = new Date(this.input.departureDate);
    const end = new Date(this.input.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  private checkWarnings(travelDays: number): void {
    const reasonLength = this.input.reason ? this.input.reason.length : 0;
    if (travelDays > 5 && reasonLength < 30) {
      this.warnings.push("long travel requests should include a detailed reason");
    }
  }

  private determineStatus(travelDays: number, totalAmount: number): TravelStatus {
    if (travelDays > 5 || totalAmount > 200000) {
      return "pending-review";
    }
    return "approved";
  }

  private buildRejectedResponse(): TravelRequestOutput {
    return {
      requestId: this.input.requestId,
      status: "rejected",
      travelDays: 0,
      dailyAmountInCents: 0,
      subtotalInCents: 0,
      totalAmountInCents: 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}