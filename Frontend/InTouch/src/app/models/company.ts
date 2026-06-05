// Moved to shared/models/company.ts during the P1 architecture migration (Wave 0).
// This re-export shim keeps existing imports ('src/app/models/company') working.
// Remove once all importers are repointed to 'shared/models'.
export * from '../shared/models/company';
