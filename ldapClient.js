const net = require("net");
const tls = require("tls");

function parseLDAPResponse(buffer) {
  let offset = 0;

  if (buffer[offset++] !== 0x30) {
    throw new Error("Formato risposta LDAP non valido");
  }

  const messageLength = buffer[offset++];

  if (buffer[offset++] !== 0x02) {
    throw new Error("Message ID tag non valido");
  }
  const messageIdLength = buffer[offset++];
  const messageId = buffer[offset];
  offset += messageIdLength;

  const responseTag = buffer[offset++];
  const responseLength = buffer[offset++];

  if (buffer[offset++] !== 0x0a) {
    throw new Error("Result code tag non valido");
  }
  const resultCodeLength = buffer[offset++];
  const resultCode = buffer[offset];
  offset += resultCodeLength;

  if (buffer[offset++] !== 0x04) {
    throw new Error("Matched DN tag non valido");
  }
  const matchedDNLength = buffer[offset++];
  const matchedDN = buffer.slice(offset, offset + matchedDNLength).toString();
  offset += matchedDNLength;

  if (buffer[offset++] !== 0x04) {
    throw new Error("Error message tag non valido");
  }
  const errorMessageLength = buffer[offset++];
  const errorMessage = buffer
    .slice(offset, offset + errorMessageLength)
    .toString();

  return {
    messageId,
    resultCode,
    matchedDN,
    errorMessage,
    success: resultCode === 0,
    description: getResultCodeDescription(resultCode),
  };
}

function getResultCodeDescription(code) {
  const resultCodes = {
    0: "Success",
    1: "Operations Error",
    2: "Protocol Error",
    3: "Time Limit Exceeded",
    4: "Size Limit Exceeded",
    5: "Compare False",
    6: "Compare True",
    7: "Auth Method Not Supported",
    8: "Strong Auth Required",
    10: "Referral",
    11: "Admin Limit Exceeded",
    12: "Unavailable Critical Extension",
    13: "Confidentiality Required",
    14: "SASL Bind In Progress",
    16: "No Such Attribute",
    17: "Undefined Attribute Type",
    18: "Inappropriate Matching",
    19: "Constraint Violation",
    20: "Attribute Or Value Exists",
    21: "Invalid Attribute Syntax",
    32: "No Such Object",
    33: "Alias Problem",
    34: "Invalid DN Syntax",
    36: "Alias Dereferencing Problem",
    48: "Inappropriate Authentication",
    49: "Invalid Credentials",
    50: "Insufficient Access Rights",
    51: "Busy",
    52: "Unavailable",
    53: "Unwilling To Perform",
    54: "Loop Detect",
    64: "Naming Violation",
    65: "Object Class Violation",
    66: "Not Allowed On Non-Leaf",
    67: "Not Allowed On RDN",
    68: "Entry Already Exists",
    69: "Object Class Mods Prohibited",
    71: "Affects Multiple DSAs",
    80: "Other",
  };
  return resultCodes[code] || "Unknown Result Code";
}

function ldapConnect(options, callback) {
  const { host, port, useTLS } = options;
  const client = useTLS ? tls.connect(port, host) : net.connect(port, host);

  client.on("connect", () => {
    console.log("Connesso al server LDAP");
    callback(null, client);
  });

  client.on("error", (err) => {
    console.error("Errore di connessione:", err);
    callback(err);
  });

  return client;
}

function createBerLength(length) {
  if (length <= 127) {
    return Buffer.from([length]);
  }

  const bytes = [];
  while (length > 0) {
    bytes.unshift(length & 0xff);
    length = length >> 8;
  }

  bytes.unshift(0x80 | bytes.length);
  return Buffer.from(bytes);
}

function ldapBind(client, dn, password, callback) {
  const messageId = Buffer.from([0x02, 0x01, 0x01]); // INTEGER 1
  const version = Buffer.from([0x02, 0x01, 0x03]); // INTEGER 3 (LDAP v3)
  const dnBuf = Buffer.from(dn);
  const dnLength = createBerLength(dnBuf.length);
  const dnSequence = Buffer.concat([Buffer.from([0x04]), dnLength, dnBuf]);

  const pwdBuf = Buffer.from(password);
  const pwdLength = createBerLength(pwdBuf.length);
  const pwdSequence = Buffer.concat([Buffer.from([0x80]), pwdLength, pwdBuf]);

  const bindSequence = Buffer.concat([version, dnSequence, pwdSequence]);
  const bindLength = createBerLength(bindSequence.length);
  const bindOperation = Buffer.concat([
    Buffer.from([0x60]),
    bindLength,
    bindSequence,
  ]);

  const messageSequence = Buffer.concat([messageId, bindOperation]);
  const messageLength = createBerLength(messageSequence.length);
  const ldapMessage = Buffer.concat([
    Buffer.from([0x30]),
    messageLength,
    messageSequence,
  ]);

  let responseData = Buffer.alloc(0);

  client.write(ldapMessage);

  client.once("data", (data) => {
    try {
      const parsedResponse = parseLDAPResponse(data);
      callback(null, parsedResponse);
    } catch (err) {
      callback(err);
    }
  });

  client.on("error", (err) => {
    callback(err);
  });
}

module.exports = {
  ldapConnect,
  ldapBind,
};
