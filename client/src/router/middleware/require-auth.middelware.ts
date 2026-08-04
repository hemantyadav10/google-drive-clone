import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router";
import { currentUserQuery } from "../../api/user/user.query";

export const requireAuth = (queryClient: QueryClient) => async () => {
  try {
    // 1. Await the actual data from the cache or network
    const user = await queryClient.ensureQueryData(currentUserQuery);

    // 2. Explicitly check if the user object exists
    if (!user) throw redirect("/login");
  } catch (error) {
    // 3. If we threw a redirect manually above, let React Router handle it
    if (error instanceof Response) throw error;

    // 4. Catch actual network errors / 401s that threw exceptions
    throw redirect("/login");
  }
};
