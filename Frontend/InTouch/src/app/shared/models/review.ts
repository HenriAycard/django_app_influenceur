import { User } from "./users";

/** A rating left after a completed collaboration. */
export interface Review {
    id: number;
    rating: number;        // 1..5
    comment: string;
    created: string;       // ISO date
    author: User;
}

/** Payload to create a review against a completed reservation. */
export interface CreateReviewDto {
    reservationId: number;
    rating: number;        // 1..5
    comment: string;
}
