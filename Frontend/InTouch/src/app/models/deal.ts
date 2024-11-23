import { CompanyBooking } from "./company";

export interface DealCompany {
    id: number;
    company: CompanyBooking;
    nameOffer: string;
    descriptionOffer: string;
    descriptionCondition: string;
}

export interface Deal {
    id: number;
    nameOffer: string;
    descriptionOffer: string;
    descriptionCondition: string;
    company: number;
}