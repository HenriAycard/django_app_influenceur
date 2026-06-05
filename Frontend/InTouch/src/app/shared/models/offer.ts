import { CompanyBooking } from "./company";

/** An offer as returned nested inside other resources (carries its venue). */
export interface OfferWithVenue {
    id: number;
    company: CompanyBooking;
    name: string;
    startDate: Date;
    endDate: Date | null;
    content: string;
    conditions: string;
    quantity: number | null;
    tags: string;
    publishingDeadline: number | null;
    contactApprover: string | null;
    paymentAmount: number | null;
    paymentTerms: string | null;
    cancellationPolicy: string | null;
    specialInstructions: string | null;
    exclusivityDuration: number | null;
    restrictedCompetitors: string | null;
    scopeExclusivity: string | null;
    exclusivityType: string | null;
    exclusivitySpecification: string | null;
}

/** A published collaboration opportunity created by a company/brand. */
export interface Offer {
    id?: number;
    company: number;
    name: string;
    startDate: Date;
    endDate: Date | null;
    content: string;
    conditions: string;
    quantity: number | null;
    tags: string;
    publishingDeadline: number | null;
    contactApprover: string | null;
    paymentAmount: number | null;
    paymentTerms: string | null;
    cancellationPolicy: string | null;
    specialInstructions: string | null;
    exclusivityDuration: number | null;
    restrictedCompetitors: string | null;
    scopeExclusivity: string | null;
    exclusivityType: string | null;
    exclusivitySpecification: string | null;
}
