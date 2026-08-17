import apiClient from "./apiClient";

export const requestRecoveryCode = async ({ email, userType }) => {
  const { data } = await apiClient.post("/auth/recovery-password/request-code", {
    email,
    userType,
  });
  return data;
};

export const verifyRecoveryCode = async ({ code, email }) => {
  const { data } = await apiClient.post("/auth/recovery-password/verify-code", {
    code,
    email,
  });
  return data;
};

export const setNewPassword = async ({ newPassword, confirmNewPassword, email }) => {
  const { data } = await apiClient.post("/auth/recovery-password/new-password", {
    newPassword,
    confirmNewPassword,
    email,
  });
  return data;
};
