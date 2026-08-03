import { useMutation } from "@tanstack/react-query";

import { apiClient } from "./api-client";

type Credentials = { email: string; password: string };

export function useSignup() {
  return useMutation({
    mutationFn: ({ email, password }: Credentials) => apiClient.signup(email, password),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: Credentials) => apiClient.login(email, password),
  });
}
