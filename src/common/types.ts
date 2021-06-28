import { Document } from 'mongoose';

export type DatabaseDocument<T> = T & Document;

export interface AuthResponse {
  token: string;
}
