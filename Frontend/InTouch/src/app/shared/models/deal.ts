// Compat shim: `Deal`/`DealCompany` were renamed to `Offer`/`OfferWithVenue` (Wave 1).
// Kept so the legacy 'src/app/models/deal' path still resolves during the migration.
// Remove once no code imports `Deal`/`DealCompany`.
export { Offer as Deal, OfferWithVenue as DealCompany } from './offer';
