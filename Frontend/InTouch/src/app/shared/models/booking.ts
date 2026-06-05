import { CompanyBooking } from "./company";
import { OfferWithVenue } from "./offer";
import { User } from "./users";

export interface BookingStatus {
    id: number;
    offer: OfferWithVenue;
    status: number;
    dateReservation: Date;
}

export interface BookingCreateParam {
    offerId: number;
    dateReservation: string;
}

export interface BookingBrand {
    id: number;
    offer: OfferWithVenue;
    status: number;
    dateReservation: Date;
    user: User;
}