import { CompanyBooking } from "./company";
import { DealCompany } from "./deal";
import { User } from "./users";

export interface BookingStatus {
    id: number;
    offer: DealCompany;
    status: number;
    dateReservation: Date;
}

export interface BookingCreateParam {
    offerId: number;
    dateReservation: string;
}

export interface BookingBrand {
    id: number;
    offer: DealCompany;
    status: number;
    dateReservation: Date;
    user: User;
}