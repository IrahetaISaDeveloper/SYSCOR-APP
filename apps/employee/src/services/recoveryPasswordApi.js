import apiClient from '@syscor/shared/src/services/apiClient';

export const requestRecoveryCode = async ({ email, userType }) => {
  const { data } = await apiClient.post("/auth/recovery-password/request-code", {
    email: email ? email.trim() : undefined,
    userType,
  });
  return data;
};

export const verifyRecoveryCode = async (params) => {
  const code = (
    typeof params === "string"
      ? params
      : params?.code || params?.codeRequest || params?.verificationCode || ""
  )
    .toString()
    .trim();
  const email = params?.email ? params.email.trim() : undefined;

  const payload = {
    code,
    codeRequest: code,
    verificationCode: code,
    recoveryCode: code,
  };
  if (email) {
    payload.email = email;
  }

  const { data } = await apiClient.post("/auth/recovery-password/verify-code", payload);
  return data;
};

export const setNewPassword = async (params) => {
  const newPassword = params?.newPassword || params?.password;
  const confirmNewPassword =
    params?.confirmNewPassword || params?.confirmPassword || newPassword;
  const email = params?.email ? params.email.trim() : undefined;

  const payload = {
    newPassword,
    confirmNewPassword,
    password: newPassword,
    confirmPassword: confirmNewPassword,
  };
  if (email) {
    payload.email = email;
  }

  const { data } = await apiClient.post("/auth/recovery-password/new-password", payload);
  return data;
};
