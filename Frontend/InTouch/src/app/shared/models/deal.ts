import { CompanyBooking } from "./company";

export interface DealCompany {
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

export interface Deal {
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