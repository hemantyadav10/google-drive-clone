import { currentUserQuery } from "@/api/user/user.query";
import type { QueryClient } from "@tanstack/react-query";

export const currentUserLoader = (queryClient: QueryClient) => () => {
  void queryClient.prefetchQuery(currentUserQuery);
};
