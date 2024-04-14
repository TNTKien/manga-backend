import { TypedResponse } from "hono";

export type TBodyResponse = {
  message: string;
};

export type SerializedData<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k];
};

export type TBaseRespone<T extends TBodyResponse> = Response & TypedResponse<T>;

export type TDataResponse<T = null> = Promise<
  TBaseRespone<TBodyResponse & { data: SerializedData<T> | null }>
>;
