export interface ErrorPayload {
  code: string;
  message: string;
}

export interface ResponseEnvelope<TPayload = any> {
  id: string;
  version: string;
  type: string;
  ok: boolean;
  payload: TPayload | null;
  error: ErrorPayload | null;
}
