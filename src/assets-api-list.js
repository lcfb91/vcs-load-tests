import http from 'k6/http';
import { check, sleep } from 'k6';
import { authenticateTalkdesk } from "./utils/auth_td.js";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';


export const options = {
  //stages: [
  //  { duration: '30s', target: 20 },
  //  { duration: '1m30s', target: 10 },
  //  { duration: '20s', target: 0 },
  //],
};

const configs = JSON.parse(open('../config.json'));

const AUTH_TOKEN_URL = `${configs.AUTH_TOKEN_URL}`;
const CLIENT_ID = `${configs.CLIENT_ID}`;
const CLIENT_SECRET = `${configs.CLIENT_SECRET}`;
const API_URL = `${configs.API_URL}`;


export function setup() {
    
    const data = authenticateTalkdesk(
      CLIENT_ID,
      CLIENT_SECRET,
      "",
      AUTH_TOKEN_URL
    );

    const session = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
      };
  
    return session;
}

function listAssets(session) {
    const res = http.get(`${API_URL}/assets`, session)

    check(res, { 
        'list assets status was 200': (r) => r.status == 200 ,
        'list assets has assets': (r) => r.json()._embedded.assets.length > 0
    });
}

export default function (session) {

    listAssets(session)

}