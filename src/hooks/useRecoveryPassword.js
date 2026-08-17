import { useState, useEffect, useCallback } from "react";
import {
  requestRecoveryCode,
  verifyRecoveryCode,
  setNewPassword as setNewPasswordRequest,
} from "../services/recoveryPasswordApi";

const RESEND_COOLDOWN_SECONDS = 120;

export default function useRecoveryPassword() {
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [inputError, setInputError] = useState("");
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResend, setIsLoadingResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const clearMessages = useCallback(() => {
    setApiError(null);
    setInputError("");
  }, []);

  // Paso 1: solicitar código
  const handleRequestCode = useCallback(
    async (emailToUse) => {
      clearMessages();
      const trimmed = (emailToUse ?? email).trim();

      if (!trimmed) {
        setInputError("El correo es requerido");
        return { ok: false };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setInputError("Ingresa un correo válido");
        return { ok: false };
      }

      setIsLoading(true);
      try {
        await requestRecoveryCode({ email: trimmed, userType: "customer" });
        setEmail(trimmed);
        setSuccess(true);
        return { ok: true, email: trimmed };
      } catch (err) {
        setApiError({
          title: err.response?.data?.title || "Correo no encontrado",
          message: err.response?.data?.message || "Verifica e inténtalo de nuevo.",
        });
        return { ok: false };
      } finally {
        setIsLoading(false);
      }
    },
    [email, clearMessages]
  );

  const handleResendCode = useCallback(async () => {
    if (timer > 0 || isLoadingResend || !email) return;

    setIsLoadingResend(true);
    clearMessages();
    setResendSuccess("");

    try {
      await requestRecoveryCode({ email, userType: "customer" });
      setTimer(RESEND_COOLDOWN_SECONDS);
      setResendSuccess("¡Código reenviado con éxito!");
    } catch (err) {
      setApiError({
        title: err.response?.data?.title || "Error al reenviar",
        message: err.response?.data?.message || "No se pudo reenviar el código.",
      });
    } finally {
      setIsLoadingResend(false);
    }
  }, [email, timer, isLoadingResend, clearMessages]);

  // Paso 2: verificar código
  const handleDigitChange = useCallback((value, index, inputRefs) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setApiError(null);
    setInputError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleDigitKeyPress = useCallback((e, index, inputRefs) => {
    if (e.nativeEvent.key === "Backspace") {
      setDigits((prev) => {
        if (prev[index]) return prev; // deja que el onChangeText normal lo borre primero
        if (index > 0) inputRefs.current[index - 1]?.focus();
        return prev;
      });
    }
  }, []);

  const handleVerifyCode = useCallback(async () => {
    clearMessages();
    const codeRequest = digits.join("");

    if (codeRequest.length < 6) {
      setInputError("Ingresa el código completo de 6 dígitos");
      return { ok: false };
    }

    setIsLoading(true);
    try {
      await verifyRecoveryCode(codeRequest);
      setSuccess(true);
      return { ok: true };
    } catch (err) {
      setApiError({
        title: err.response?.data?.title || "Código inválido",
        message: err.response?.data?.message || "El código es incorrecto o ha expirado.",
      });
      return { ok: false };
    } finally {
      setIsLoading(false);
    }
  }, [digits, clearMessages]);

  // Paso 3: nueva contraseña
  const handleResetPassword = useCallback(async () => {
    clearMessages();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setInputError("Por favor, ingresa y confirma la nueva contraseña");
      return { ok: false };
    }
    if (newPassword !== confirmPassword) {
      setInputError("Las contraseñas no coinciden");
      return { ok: false };
    }
    if (newPassword.length < 6) {
      setInputError("La contraseña debe tener al menos 6 caracteres");
      return { ok: false };
    }

    setIsLoading(true);
    try {
      await setNewPasswordRequest({ newPassword, confirmNewPassword: confirmPassword });
      setSuccess(true);
      return { ok: true };
    } catch (err) {
      setApiError({
        title: err.response?.data?.title || "Error de actualización",
        message: err.response?.data?.message || "No se pudo actualizar la contraseña.",
      });
      return { ok: false };
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, clearMessages]);

  const resetFlowState = useCallback(() => {
    setDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(false);
    setApiError(null);
    setInputError("");
    setResendSuccess("");
    setTimer(0);
  }, []);

  return {
    email,
    setEmail,
    digits,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    inputError,
    apiError,
    isLoading,
    isLoadingResend,
    resendSuccess,
    timer,
    success,
    handleRequestCode,
    handleResendCode,
    handleDigitChange,
    handleDigitKeyPress,
    handleVerifyCode,
    handleResetPassword,
    resetFlowState,
  };
}