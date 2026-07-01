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

## To do
Add more info to README 
Add diagram pdf file