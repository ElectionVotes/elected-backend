import KcAdminClient from '@keycloak/keycloak-admin-client';

const kcAdminClient = new KcAdminClient({
  baseUrl: 'https://81f4-196-74-216-117.ngrok-free.app', // Keycloak server URL
  realmName: 'Elected',             // Default realm name
});

const initKeycloak = async () => {
  try {
    await kcAdminClient.auth({
      grantType: 'client_credentials',
      clientId: 'admin-cli',        // Client ID for admin
      clientSecret: '39ykECnZMtFLgsDuaUifc5OZStKgRNco', // Replace with your actual client secret
    });
    console.log("Keycloak Admin Client initialized successfully");
    return kcAdminClient;
  } catch (error) {
    console.error("Error initializing Keycloak Admin Client", error);
    throw error;
  }
};

const kcAdminClientPromise = initKeycloak();

export default kcAdminClientPromise;
