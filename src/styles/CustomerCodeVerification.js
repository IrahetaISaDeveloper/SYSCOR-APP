import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  circleLeft: {
    position: 'absolute',
    left: -100,
    top: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  circleRight: {
    position: 'absolute',
    right: -100,
    bottom: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 200, 0, 0.03)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1B1C1C', // Color exacto solicitado para el título principal
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#5B403D', // Color exacto solicitado para los textos debajo
    textAlign: 'center',
    marginBottom: 25,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#DC2626',
    fontSize: 14,
  },
  errorMessage: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#AF101A', // Color de acento consistente para acciones secundarias
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#aaa',
  },
});