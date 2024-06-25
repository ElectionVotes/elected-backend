const KcAdminClient = require('keycloak-admin');

const kcAdminClient = new KcAdminClient({
  baseUrl: 'http://localhost:8080/auth',
  realmName: 'Elected',
});

const initKeycloak = async () => {
  await kcAdminClient.auth({
    grantType: 'client_credentials',
    clientId: 'react-client',
    clientSecret: 'fKMsHPTfolY6FqVEGdhCfWi5qGsly9gh', // Replace YOUR_CLIENT_SECRET with the actual secret
  });
};

initKeycloak();

module.exports = kcAdminClient;
