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
const FILE_TO_UPLOAD = `${configs.FILE_TO_UPLOAD}`;

const binFile = open(FILE_TO_UPLOAD, 'b');

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

function assetsRequest(session) {
    const rawResponse = http.post(`${API_URL}/assets-requests`, JSON.stringify({}), session)


    check(rawResponse, { 'assets request status was 200': (r) => r.status == 200 });

    const res = rawResponse.json()

    return {
        'request_id': res['id'],
        'upload_url': res['_links']['upload_link']['href']
    }
    
}

function uploadFileS3(session, upload_url){
    
    const rawResponse = http.put(upload_url, binFile, JSON.stringify({
        'Content-Type': 'audio/mpeg'
    }))
    check(rawResponse, { 'upload file to s3 status was 200': (r) => r.status == 200 });

}

function createAsset(session, request_id){
    const rawResponse = http.post(`${API_URL}/assets`, JSON.stringify({
        "name": `${randomString(16)}.mp3`,
        "request_id": request_id
    }), session)

    check(rawResponse, { 'create asset status was 201': (r) => r.status == 201 });


    const res = rawResponse.json()

    return {
        'asset_id': res['id']
    }
}

function uploadFile(session) {
    const asset = assetsRequest(session)

    uploadFileS3(session, asset.upload_url)

    const createdAsset = createAsset(session, asset.request_id)

    getAsset(session, createdAsset.asset_id)


}

function getAsset(session, asset_id) {
    const res = http.get(`${API_URL}/assets/${asset_id}`, session)

    check(res, { 
        'status was 200': (r) => r.status == 200 ,
        'state is published': (r) => r.json().state == 'published' 
    });
}

export default function (session) {

    uploadFile(session)

}