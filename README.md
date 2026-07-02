# Members
Gabriel Dias Lemos Martins
Lorena Bezerra Martins

# TEC2 Final Assessment Base

This is the base repository for the final assessment of Tópicos Especiais em Computação II.

The official assignment statement is available at [`docs/tec2-aval.md`](docs/tec2-aval.md). This README is only an operational guide and does not replace the assignment statement.


## Setup

```bash
npm install
```

## Checks

```bash
npm run typecheck
npm test
npm run test:original
```

## Database

Copy `.env.example` to `.env` if you want to keep the database URL in your local environment.

```bash
npm run db:up
npm run db:init
npm run db:down
```

### Critical Use of Artificial Intelligence

During the development of this activity, the use of AI was adopted in a guided and critical manner, acting as a *pair programming* tool.

* **Tools used:** Google Gemini.
* **How the AI was used:** The tool was consulted to assist in structuring domain classes (Object-Oriented Programming), crafting the SQL statement with *upsert* behavior for PostgreSQL, and generating dummy data for boundary testing (rigorous edge cases).
* **Accepted suggestions:** The adoption of the `ON CONFLICT (id) DO UPDATE SET` clause in the infrastructure repository to prevent data duplication, and the use of an asynchronous execution with `.catch()` in `src/main.ts` to persist data in the database without breaking the synchronous signature required by the public contract.
* **Rejected or modified suggestions:** The AI initially suggested a date validation based solely on a Regular Expression (`^\d{4}-\d{2}-\d{2}$`). This suggestion failed the legacy preservation tests because it allowed non-existent dates (e.g., February 30th). The solution was rejected, and the team modified the logic to include deep mathematical validations using `new Date()` and `.toISOString()`. Additionally, the repository interface signature initially suggested by the AI only received the processed object (`output`), but it was modified by the team to also receive the `input` in order to satisfy the exact database schema (which required columns like `requester_name`).
* **Technical validation:** Absolutely all generated or suggested code was validated by the team through the execution of the legacy test suite (`npm run test:original`), the rigorous domain and application tests created by the team (`npm test`), and the strict TypeScript type checker (`npm run typecheck`).

### Technical Decisions and Solution

The solution was developed focusing on **Clean Architecture** and **Dependency Inversion**, ensuring that the core of the system does not know about framework or database details.

* **Domain (`src/domain`):** Business rules were centralized in the `TravelRequest` entity. It is a pure TypeScript class responsible for validating dates, applying mathematical rules for daily rates by role, and defining the request's *status*.
* **Application (`src/application`):** We created the `ProcessTravelRequestUseCase` to orchestrate the flow. It receives the data, triggers the Domain for calculation, and uses an abstract interface (`TravelRequestRepository`) to delegate persistence.
* **Infrastructure (`src/infra`):** The `PgTravelRequestRepository` implements the application interface using the `pg` library. It acts as an adapter, mapping Domain data (`camelCase`) to the exact format required by the database columns (`snake_case`) defined in the `init.sql` file.
* **Public Contract (`src/main.ts`):** To maintain the behavior expected by the preservation tests, `main.ts` acts as an entry point (*CLI/Entrypoint*) that immediately returns the validated calculation (synchronous) but dispatches the persistence instruction to the database in the background.

**How to verify the solution:** To attest the required behavior, start the database via Docker (`npm run db:up` and `npm run db:init`) and run the command `npm test`. You will see that both the original tests in `tests/original/` and the new rigorous use case tests operate perfectly integrated into the new architecture.