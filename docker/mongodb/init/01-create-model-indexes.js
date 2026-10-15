const tass = db.getSiblingDB('trabajotass');

tass.companies.createIndex({ nit: 1 }, { unique: true });
tass.authorizedpeople.createIndex({ numeroDocumento: 1 }, { unique: true });
tass.users.createIndex({ correo: 1 }, { unique: true });
tass.users.createIndex(
  { tipoDocumento: 1, numeroDocumento: 1 },
  { unique: true },
);
tass.familyrelationships.createIndex(
  { usuario: 1, familiar: 1 },
  { unique: true },
);
tass.conflicts.createIndex({ codigo: 1 }, { unique: true });
