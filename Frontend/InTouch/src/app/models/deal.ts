// Moved to shared/models/deal.ts during the P1 architecture migration (Wave 0).
// This re-export shim keeps existing imports ('src/app/models/deal') working.
// Remove once all importers are repointed to 'shared/models' (and Deal -> Offer in Wave 1).
export * from '../shared/models/deal';
