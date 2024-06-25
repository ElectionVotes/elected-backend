const KeycloakAdminClient = require('keycloak-nodejs-admin-client');

const kcAdminClient = new KeycloakAdminClient({
  baseUrl: 'http://localhost:8080/auth',
  realmName: 'Elected',
});

const initKeycloak = async () => {
  try {
    await kcAdminClient.auth({
      grantType: 'client_credentials',
      clientId: 'react-client',
      clientSecret: 'fKMsHPTfolY6FqVEGdhCfWi5qGsly9gh',
    });
    console.log("Keycloak Admin Client initialized successfully");
  } catch (error) {
    console.error("Error initializing Keycloak Admin Client", error);
  }
};

initKeycloak();

module.exports = kcAdminClient;
