# Project Tasks

## Installation

- `yarn install` on first setup
- `sequelize db:migrate` for db migration.
- `yarn dev` for dev mode
- `yarn start` for production ready compiled mode
- If getting webpack errors during major Nextjs transitions, please remove `.next` and `node_modules` folders
- Requires `nodejs` version of 16 at least to run

## PostGis ACTIVATION

- `sudo apt install postgis postgresql-14-postgis-3` PostGis installation for Ubuntu and PSQL 13
- `sudo -u postgres psql`
- `\c logistic;`
- Run below sql queries:
  - `CREATE EXTENSION postgis;`
  - `CREATE EXTENSION postgis_topology;`
  - `CREATE EXTENSION fuzzystrmatch;`
  - `CREATE EXTENSION postgis_tiger_geocoder;`
