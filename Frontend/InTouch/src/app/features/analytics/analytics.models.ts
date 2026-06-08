/** Venue analytics (chantier #5) — keys mirror VenueAnalyticsView, camelCased
 *  by the backend's CamelCaseJSONRenderer. */
export interface VenueAnalytics {
    applicationsTotal: number;
    pending: number;
    accepted: number;
    declined: number;
    acceptanceRate: number | null;
    partnershipsCompleted: number;
    upcoming: number;
    influencersReceived: number;
    activeOffers: number;
    pageViews: number;
    uniqueVisitors: number;
    averageRating: number | null;
    reviewCount: number;
}

/** Influencer analytics (chantier #6) — mirrors InfluencerAnalyticsView. */
export interface InfluencerAnalytics {
    applicationsSent: number;
    pending: number;
    accepted: number;
    declined: number;
    acceptanceRate: number | null;
    collaborationsRealized: number;
    upcoming: number;
    venuesVisited: number;
    averageRating: number | null;
    reviewCount: number;
}
