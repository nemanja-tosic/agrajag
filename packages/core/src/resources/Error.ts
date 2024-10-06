export interface ErrorObject {
  errors: {
    id?: string;
    status: string;
    title?: string;
    detail?: string;
    source?: { pointer?: string; parameter?: string };
  }[];
  meta?: Record<string, any>;
}
