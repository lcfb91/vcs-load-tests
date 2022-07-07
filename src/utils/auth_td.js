import http from "k6/http";
import encoding from "k6/encoding";

/**
 * Authenticate using Talkdesk OAuth
 * @function
 * @param  {string} clientId - Client ID in OAuth Talkdesk
 * @param  {string} clientSecret - Client secret used to authenticate
 * @param  {string} scope - Space-separated list of scopes (permissions) [check if is necessary]
 * @param  {string} talkdeskdUrlOauth - URL to obtain the token access at Talkdesk.
 */
export function authenticateTalkdesk(
  clientId,
  clientSecret,
  scope,
  talkdeskdUrlOauth
) {
  const client_btoa = encoding.b64encode(`${clientId}:${clientSecret}`);
  const requestHeader = {
    headers: {
      authorization: `Basic ${client_btoa}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const requestBody = {
    grant_type: "client_credentials",
    client_id: clientId,
    scope: scope,
  };

  const response = http.post(talkdeskdUrlOauth, requestBody, requestHeader);

  return response.json();
}