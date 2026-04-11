import { jest } from "@jest/globals";

export function mockRequest(data = {}) {
  return {
    body: {},
    params: {},
    query: {},
    user: {},
    file: null,
    headers: {},
    ...data,
  };
}

export function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}