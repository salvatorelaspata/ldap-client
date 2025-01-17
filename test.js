const { ldapConnect, ldapBind } = require("./ldapClient");

const options = {
  host: "localhost",
  port: 389,
  useTLS: false,
};

ldapConnect(options, (err, client) => {
  if (err) {
    console.error("Errore di connessione:", err);
  } else {
    const dn = "cn=admin,dc=example,dc=org"; // Nota: modificato per matchare il docker-compose
    const password = "admin"; // Nota: modificato per matchare il docker-compose

    ldapBind(client, dn, password, (err, response) => {
      if (err) {
        console.error("Errore nel Bind:", err);
      } else {
        console.log("Risposta LDAP parsata:", response);
        /*
        Esempio di output:
        {
          messageId: 1,
          resultCode: 0,
          matchedDN: "",
          errorMessage: "",
          success: true,
          description: "Success"
        }
        */
      }
      client.end();
    });
  }
});
