import * as LocalAuthentication from 'expo-local-authentication';

export const autenticarBiometria = async (): Promise<boolean> => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const saved = await LocalAuthentication.isEnrolledAsync();

  if (!compatible || !saved) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autenticación requerida',
    fallbackLabel: 'Usar PIN del sistema',
  });

  return result.success;
};
