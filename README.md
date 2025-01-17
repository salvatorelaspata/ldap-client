# LDAP CLIENT

## Description

This is a simple LDAP client that can be used to query an LDAP server. It is written in javascript and have 0 dependencies.

## Start local LDAP server

To start a local LDAP server, you can use the following docker-compose file:

```bash
docker compose up -d
```

## Usage

```javascript
const ldap = require('ldap-client');

const client = new ldap.Client({
  uri: 'ldap://localhost:389',
  base: 'dc=example,dc=com',
  bind: {
    dn: 'cn=admin,dc=example,dc=com',
    password: 'admin'
  }
});

client.search({
  filter: '(objectClass=*)',
  scope: 'sub',
  attributes: ['cn', 'sn']
}).then((res) => {
  console.log(res);
}).catch((err) => {
  console.error(err);
});
```

## API

### `new ldap.Client(options)`
Creates a new instance of the LDAP client.

#### Options
- `uri` - The URI of the LDAP server.
- `base` - The base DN.
- `bind` - The bind credentials.
  - `dn` - The bind DN.
  - `password` - The bind password.

### `client.search(options)`
Searches the LDAP server.

#### Options
- `filter` - The search filter.
- `scope` - The search scope.
- `attributes` - The attributes to return.

## License

MIT