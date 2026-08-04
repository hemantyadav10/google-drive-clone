import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "react-router";
import { currentUserQuery } from "../../api/user/user.query";

export const requireGuest = (queryClient: QueryClient) => async () => {
  console.log("Guest middleware running");
  try {
    const user = await queryClient.ensureQueryData(currentUserQuery);
    if (user) throw redirect("/home");
  } catch (error) {
    if (error instanceof Response) throw error;
  }
};
