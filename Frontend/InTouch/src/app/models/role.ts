// Moved to shared/models/role.ts during the P1 architecture migration (Wave 0).
// This re-export shim keeps existing imports ('src/app/models/role') working,
// including the runtime const exports (company, influencer, unknow).
// Remove once all importers are repointed to 'shared/models'.
export * from '../shared/models/role';
