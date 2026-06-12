/**
 * Lifecycle state of an influencer's application to an offer.
 *
 * The backend currently represents this as an integer (0/1/2). This enum is the
 * single place that knows that mapping — convert at the API boundary with
 * `toApiStatus` / `fromApiStatus` so the rest of the app never sees magic numbers.
 */
export enum ApplicationStatus {
  Pending  = 'PENDING',    // was 0 — applied, awaiting the brand's decision
  Accepted = 'ACCEPTED',   // was 1 — confirmed collaboration
  Declined = 'DECLINED',   // was 2 — rejected or cancelled
  Invited  = 'INVITED',    // was 3 — brand-initiated direct invitation
}

const TO_API: Record<ApplicationStatus, number> = {
  [ApplicationStatus.Pending]: 0,
  [ApplicationStatus.Accepted]: 1,
  [ApplicationStatus.Declined]: 2,
  [ApplicationStatus.Invited]: 3,
};

const FROM_API = new Map<number, ApplicationStatus>(
  (Object.keys(TO_API) as ApplicationStatus[]).map(status => [TO_API[status], status]),
);

export function toApiStatus(status: ApplicationStatus): number {
  return TO_API[status];
}

export function fromApiStatus(value: number): ApplicationStatus {
  return FROM_API.get(value) ?? ApplicationStatus.Pending;
}
