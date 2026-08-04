import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query-keys";
import { userApi } from "./user.api";

export const currentUserQuery = queryOptions({
  queryKey: queryKeys.currentUser,
  queryFn: userApi.getCurrentUser,
  retry: false,
  staleTime: Infinity,
});
