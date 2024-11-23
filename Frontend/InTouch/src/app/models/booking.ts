import { CompanyBooking } from "./company";
import { DealCompany } from "./deal";

export interface BookingStatus {
    id: number;
    offer: DealCompany;
    status: number;
    dateReservation: Date;
}

export interface BookingCreateParam {
    offer: number;
    dateReservation: string;
}