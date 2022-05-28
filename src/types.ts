import * as express from 'express';

export interface ResponseError {
  status?: number;
  message?: string;
}

export type ControllerFn = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void;

export type AsyncFunctionCallback = (
  err: Error | null | undefined,
  result: unknown,
) => void;
