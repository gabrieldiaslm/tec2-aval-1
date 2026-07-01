import { 
  TravelRequestInput, 
  TravelRequestOutput, 
  TravelRequest,
  RequesterType, // Adicionando a importação do tipo
  TravelStatus   // Adicionando por precaução
} from './domain/travel-request';
import { PgTravelRequestRepository } from './infra/pg-travel-request-repository';
export { 
  TravelRequestInput, 
  TravelRequestOutput, 
  RequesterType, 
  TravelStatus as TravelRequestStatus
};
const repository = new PgTravelRequestRepository();
export function processTravelRequest(input: TravelRequestInput): TravelRequestOutput {
  const request = new TravelRequest(input);
  const output = request.analyze();
  repository.save(input, output).catch(error => {
    console.error("Failed to persist travel request in background:", error);
  });

  return output;
}