// Barrel for the domain models. New code should import from 'src/app/shared/models'
// rather than the individual files. During the P1 migration the legacy
// 'src/app/models/*' paths still work via re-export shims.
export * from './address';
export * from './application';
export * from './enums/application-status';
export * from './company';
export * from './offer';
export * from './opening-date';
export * from './role';
export * from './users';
