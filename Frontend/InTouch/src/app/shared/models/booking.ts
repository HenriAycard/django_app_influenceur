// Compat shim: `Booking*` types were renamed to the `Application` family (Wave 2).
//   BookingBrand       -> Application
//   BookingStatus      -> ApplicationView
//   BookingCreateParam -> CreateApplicationDto
// Kept so the legacy 'src/app/models/booking' path still resolves during the migration.
// Remove once no code imports the Booking* names.
export {
    Application as BookingBrand,
    ApplicationView as BookingStatus,
    CreateApplicationDto as BookingCreateParam,
} from './application';
