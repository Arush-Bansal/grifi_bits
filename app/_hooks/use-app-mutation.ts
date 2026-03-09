"use client";

import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";

export interface AppMutationOptions<TData = unknown, TError = Error, TVariables = void, TContext = unknown> 
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  successMessage?: string;
}

/**
 * A wrapper around TanStack's useMutation that provides standardized error handling
 * and potentially other global behaviors (like showing a global loader).
 */
export function useAppMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options: AppMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    ...options,
    onSuccess: (...args) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.onSuccess) {
        return options.onSuccess(...args);
      }
    },
    onError: (...args) => {
      const [err] = args;
      // Global error handling for Axios errors
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<{ error?: string; message?: string }>;
        const status = error.response?.status;
        const message = error.response?.data?.error || error.response?.data?.message || error.message;

        if (status && status >= 500) {
          toast.error("A server error occurred. Please try again later.");
        } else if (status === 401) {
          toast.error("Your session has expired. Please log in again.");
        } else if (message) {
          toast.error(message);
        } else if (!status) {
          toast.error("Network error. Please check your connection.");
        }
      } else if (err instanceof Error) {
        toast.error(err.message);
      }

      // Call the original onError if provided
      if (options.onError) {
        return options.onError(...args);
      }
    },
  });
}
