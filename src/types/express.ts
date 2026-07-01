import type { Request } from "express";
import type { ParsedQs } from "qs";

export type RequestWithBody<TBody> = Request<
  Record<string, never>,
  unknown,
  TBody
>;

export type RequestWithParams<TParams> = Request<TParams, unknown, unknown>;

export type RequestWithQuery<TQuery extends ParsedQs> = Request<
  Record<string, never>,
  unknown,
  unknown,
  TQuery
>;

export type RequestWithParamsAndBody<TParams, TBody> = Request<
  TParams,
  unknown,
  TBody
>;

export type RequestWithParamsAndQuery<
  TParams,
  TQuery extends ParsedQs,
> = Request<TParams, unknown, unknown, TQuery>;

export type RequestWithParamsBodyAndQuery<
  TParams,
  TBody,
  TQuery extends ParsedQs,
> = Request<TParams, unknown, TBody, TQuery>;
