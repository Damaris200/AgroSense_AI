export interface EventLogRecord {
  id:           string;
  eventType:    string;
  submissionId: string;
  payloadJson:  unknown;
  loggedAt:     Date;
}

export type EventTopic =
  | 'farm.submitted'
  | 'farm.saved'
  | 'analysis.ready'
  | 'recommendation.generated';
