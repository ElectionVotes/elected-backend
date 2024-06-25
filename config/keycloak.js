const KcAdminClient = require('keycloak-admin');

const kcAdminClient = new KcAdminClient({
  baseUrl: 'http://localhost:8080/auth',
  realmName: 'Elected',
});

const initKeycloak = async () => {
  await kcAdminClient.auth({
    username: 'ynov',
    password: 'ynov',
    grantType: 'password',
    clientId: 'react-client',
  });
};

initKeycloak();

module.exports = kcAdminClient;
