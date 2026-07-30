import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../mocks/api-client";
import { createQueryWrapper } from "../test/query-client-wrapper";
import { useLogin, useSignup } from "./auth";

beforeEach(() => {
  resetMockData();
});

describe("useSignup", () => {
  it("resolves with the created user on success", async () => {
    const { result } = renderHook(() => useSignup(), { wrapper: createQueryWrapper() });
    result.current.mutate({ email: "nova@example.com", password: "senha1234" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ email: "nova@example.com" });
  });

  it("surfaces email_already_registered for a seeded email", async () => {
    const { result } = renderHook(() => useSignup(), { wrapper: createQueryWrapper() });
    result.current.mutate({ email: "ana@example.com", password: "senha1234" });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ code: "email_already_registered" });
  });
});

describe("useLogin", () => {
  it("resolves with the user on valid credentials", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createQueryWrapper() });
    result.current.mutate({ email: "ana@example.com", password: "senha1234" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "user-1", email: "ana@example.com" });
  });

  it("surfaces invalid_credentials for a wrong password", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createQueryWrapper() });
    result.current.mutate({ email: "ana@example.com", password: "wrong" });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ code: "invalid_credentials" });
  });
});
