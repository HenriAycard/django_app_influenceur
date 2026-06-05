import { OfferWithVenue } from "./offer";
import { User } from "./users";
import { ApplicationStatus } from "./enums/application-status";

/** An influencer's application to an offer, as seen in list/status views. */
export interface ApplicationView {
    id: number;
    offer: OfferWithVenue;
    status: ApplicationStatus;
    dateReservation: Date;
}

/** Payload to create a new application against an offer. */
export interface CreateApplicationDto {
    offerId: number;
    dateReservation: string;
}

/** An application with the applying influencer attached (brand-facing detail). */
export interface Application {
    id: number;
    offer: OfferWithVenue;
    status: ApplicationStatus;
    dateReservation: Date;
    user: User;
}
