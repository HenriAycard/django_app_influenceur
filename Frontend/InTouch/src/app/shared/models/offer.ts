import { VenueBooking } from "./venue";

/** An offer as returned nested inside other resources (carries its venue). */
export interface OfferWithVenue {
    id: number;
    venue: VenueBooking;
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
    guests: number | null;
    minFollowersInstagram: number | null;
    minFollowersTiktok: number | null;
    minFollowersYoutube: number | null;
    requirePostProof: boolean;
}

/** A published collaboration opportunity created by a venue/brand. */
export interface Offer {
    id?: number;
    venue: number;
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
    guests: number | null;
    minFollowersInstagram: number | null;
    minFollowersTiktok: number | null;
    minFollowersYoutube: number | null;
    requirePostProof: boolean;
}
