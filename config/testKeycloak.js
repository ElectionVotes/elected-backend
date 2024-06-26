(async () => {
    const { default: KcAdminClient } = await import('@keycloak/keycloak-admin-client');
  
    const kcAdminClient = new KcAdminClient({
      baseUrl: 'https://81f4-196-74-216-117.ngrok-free.app',
      realmName: 'Elected',
    });
  
    const testKeycloak = async () => {
      try {
        await kcAdminClient.auth({
          grantType: 'client_credentials',
          clientId: 'admin-cli',
          clientSecret: '39ykECnZMtFLgsDuaUifc5OZStKgRNco', // Replace with your actual client secret
        });
  
        console.log("Client initialized successfully");
  
        const realms = await kcAdminClient.realms.find();
        console.log('Realms:', realms);
  
        const users = await kcAdminClient.users.find({ first: 0, max: 10 });
        console.log('Users:', users);
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    await testKeycloak();
  })();
  