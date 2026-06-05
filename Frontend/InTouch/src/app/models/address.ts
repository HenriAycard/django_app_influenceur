// Moved to shared/models/address.ts during the P1 architecture migration (Wave 0).
// This re-export shim keeps existing imports ('src/app/models/address') working.
// Remove once all importers are repointed to 'shared/models'.
export * from '../shared/models/address';
