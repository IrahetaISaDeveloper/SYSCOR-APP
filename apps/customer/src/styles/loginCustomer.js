import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 220,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B1C1C',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C62828',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#C62828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 25,
  },
  linkRegister: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  linkForgot: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
  },
});