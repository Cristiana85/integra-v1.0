export interface RequestEnvelope<TPayload = any> {
  id: string;
  version: string;
  type: string;
  payload: TPayload;
}
