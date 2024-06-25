(async () => {
    const { default: KcAdminClient } = await import('@keycloak/keycloak-admin-client');
  
    const kcAdminClient = new KcAdminClient({
      baseUrl: 'http://196.74.216.117:8080', // Keycloak server URL
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
      } catch (error) {
        console.error("Error initializing Keycloak Admin Client", error);
      }
    };
  
    await initKeycloak();
  
    module.exports = kcAdminClient;
  })();
  