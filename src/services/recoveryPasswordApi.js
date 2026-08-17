import apiClient from "./apiClient";

export const requestRecoveryCode = async ({ email, userType }) => {
  const { data } = await apiClient.post("/auth/recovery-password/request-code", {
    email,
    userType,
  });
  return data;
};

export const verifyRecoveryCode = async (codeRequest) => {
  const { data } = await apiClient.post("/auth/recovery-password/verify-code", {
    codeRequest,
  });
  return data;
};

export const setNewPassword = async ({ newPassword, confirmNewPassword }) => {
  const { data } = await apiClient.post("/auth/recovery-password/new-password", {
    newPassword,
    confirmNewPassword,
  });
  return data;
};