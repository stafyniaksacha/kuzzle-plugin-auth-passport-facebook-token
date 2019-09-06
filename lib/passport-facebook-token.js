/* eslint-disable require-jsdoc */
const Strategy = require('passport-strategy').Strategy
const FB = require('fb')

class FacebookTokenStrategy extends Strategy {
  constructor(options, verify) {
    super(options, verify)

    if (!Object.prototype.hasOwnProperty.call(options, 'clientID') || !options.clientID) {
      throw new Error('FacebookTokenStrategy: missing clientID')
    }

    if (!Object.prototype.hasOwnProperty.call(options, 'appToken') || !options.appToken) {
      throw new Error('FacebookTokenStrategy: missing appToken')
    }

    if (!Object.prototype.hasOwnProperty.call(options, 'profileFields') || !options.profileFields) {
      throw new Error('FacebookTokenStrategy: missing profileFields')
    }

    this.name = 'facebook-token'
    this._verify = verify
    this._clientID = options.clientID.toString()
    this._appToken = options.appToken.toString()
    this._profileFields = options.profileFields

    FB.options({
      version: options.fbGraphVersion || 'v4.0',
    })
    this.facebookClient = FB.extend({
      appId: this._clientID,
      accessToken: this._appToken,
    })
  }

  authenticate (request, options) {
    if (!Object.prototype.hasOwnProperty.call(request, 'body')
    || !Object.prototype.hasOwnProperty.call(request.body, 'access_token')
    ) {
      this.fail(new Error("Must provide an access_token"))
      return
    }

    // check user access_token from facebook api
    this.facebookClient.api(
      `/debug_token?input_token=${request.body.access_token}`,
      tokenResponse => {
        if (!tokenResponse
          || Object.prototype.hasOwnProperty.call(tokenResponse, 'error')
        ) {
          this.fail(new Error((tokenResponse || {
            error: {},
          }).error.message || 'Unable to get response from facebook api'))

          return
        }

        // ensure token is valid
        if (!Object.prototype.hasOwnProperty.call(tokenResponse, 'data')
        || !Object.prototype.hasOwnProperty.call(tokenResponse.data, 'is_valid')
        || tokenResponse.data.is_valid === false
        ) {
          this.fail(new Error("access_token is invalid"))
          return
        }

        // ensure token match application id
        if (!Object.prototype.hasOwnProperty.call(tokenResponse.data, 'app_id')
        || tokenResponse.data.app_id !== this._clientID
        ) {
          this.fail(new Error("access_token does not match current app"))
          return
        }

        // ensure token is not expired
        if (!Object.prototype.hasOwnProperty.call(tokenResponse.data, 'expires_at')
        || tokenResponse.data.expires_at > Date.now()
        ) {
          this.fail(new Error("access_token is expired"))
          return
        }

        // request user profile fields
        FB.api('me', {
          fields: this._profileFields,
          access_token: request.body.access_token,
        }, (facebookProfile) => {
          if (!facebookProfile || Object.prototype.hasOwnProperty.call(facebookProfile, 'error')) {
            this.fail(new Error((tokenResponse || {
              error: {},
            }).error.message || 'Unable to get response from facebook api'))
          } else {
            if (this._verify) {
              const verified = (error, user, info) => {
                if (error) return this.error(error);
                if (!user) return this.fail(info);

                return this.success(user, info);
              };

              // send back request to kuzzle plugin to verify user
              this._verify(
                request,
                facebookProfile,
                verified
              )
            }
          }
        });
      }

    );
  }
}

module.exports = FacebookTokenStrategy;
