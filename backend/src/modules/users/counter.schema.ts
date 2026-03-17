import { Schema } from 'mongoose';

/**
 * Counter collection for generating sequential user IDs (mediflow1, mediflow2, ...).
 * _id = counter name (e.g. 'userId'), value = last used number.
 * Deleted users never reuse numbers because we only ever increment.
 */
export const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    value: { type: Number, required: true, default: 0 },
  },
  { _id: true },
);

export interface CounterDocument {
  _id: string;
  value: number;
}
