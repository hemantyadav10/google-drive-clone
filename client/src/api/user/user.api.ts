import { apiClient } from "../../lib/api-client";
import { ApiResponseSchema } from "../../schemas/api.schema";
import { UserProfileSchema } from "../../schemas/auth.schema";

export const userApi = {
  getCurrentUser: async () => {
    const { data } = await apiClient.get("/users/me");
    const response = ApiResponseSchema(UserProfileSchema).parse(data);
    return response.data;
  },
};
