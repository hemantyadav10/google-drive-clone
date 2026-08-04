import { userSessionsQuery } from "@/api/auth/auth.query";
import type { QueryClient } from "@tanstack/react-query";

export const securitySettingsLoader = (queryClient: QueryClient) => () => {
  void queryClient.prefetchQuery(userSessionsQuery);
};
