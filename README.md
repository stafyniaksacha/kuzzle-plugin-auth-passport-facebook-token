# kuzzle-plugin-auth-passport-facebook-token

This plugin provides a way to verify `access_token` provided by any client authorized by your Facebook Application.

# Configuration

### Minimum configuration:

```json
{
  "strategyCredentials": {
    "clientID": "<facebook_client_id>",
    "appToken": "<facebook_application_id>",
    "profileFields": ["id"]
  },
  "identifierAttribute": "id"
}
```

### Full configuration:

```json
{
  "strategyCredentials": {
    "clientID": "<facebook_client_id>",
    "appToken": "<facebook_application_id>",
    "profileFields": ["first_name", "last_name", "email", "picture"]
  },
  "contentMapping": {
    "firstname": "first_name",
    "lastname": "last_name",
    "email": "email",
    "picture.url": "picture.data.url"
  },
  "updateUserCredentials": true,
  "identifierAttribute": "email"
}
```


* `strategyCredentials`: used to verify token validity from facebook api:
  * `clientID`:  your Facebook application ID.  
  *see: https://developers.facebook.com/apps/*
  * `appToken`: your private App Token from same application ID.  
  *see: https://developers.facebook.com/tools/accesstoken*  
  * `profileFields`: array of requested fields when retreiving user profile, depends on authorizations provided by user `access_token`  
  *see: https://developers.facebook.com/docs/graph-api/reference/user/*  
  * `fbGraphVersion`: *(default: `v4.0`)* facebook Graph API version
* `identifierAttribute`: used to match Kuzzle user `kuid`
* `contentMapping`: *(default: `null`)* persist Facebook user profile fields as default user content. 
* `updateUserCredentials`: *(default: `false`)* if `true`, create credentials for `facebook-token` strategy on login if user already exists, otherwise user should request `/credentials/facebook-token/_me/_create` controller

# Usage

Ask user to generate an `access_token` from your frontend application (mobile, web, desktop) then login with `facebook-token` strategy:

```json
{
  "controller": "auth",
  "action": "login",
  "strategy": "facebook-token",
  "body": {
    "access_token": "<facebook_user_access_token>",
  }
}
```


# About Kuzzle

For UI and linked objects developers, [Kuzzle](https://github.com/kuzzleio/kuzzle) is an open-source solution that handles all the data management
(CRUD, real-time storage, search, high-level features, etc).

[Kuzzle](https://github.com/kuzzleio/kuzzle) features are accessible through a secured API. It can be used through a large choice of protocols such as REST, Websocket or Message Queuing protocols.