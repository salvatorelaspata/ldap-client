# LDAP CLIENT

## Description

This is a simple LDAP client that can be used to query an LDAP server. It is written in javascript and have 0 dependencies.

## Start local LDAP server

To start a local LDAP server, you can use the following docker-compose file:

```bash
docker compose up -d
```

open `http://localhost:8080` in your browser and login with the following credentials:

- User: `cn=admin,dc=example,dc=com`
- Password: `admin`

after you can upload the mock data from the `test-users.ldif` file.

```bash
ldapadd -x -D "cn=admin,dc=example,dc=com" -w admin -f test-users.ldif
```

or from the web interface.

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