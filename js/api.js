import { Alert } from 'react-native';
import Url from 'url';
import FirebaseConstants from './FirebaseConstants';

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

const GROUP_URL = 'https://iid.googleapis.com/notification';
const GROUP_HEADERS = new Headers({
  'Content-Type': 'application/json',
  Authorization: `key=${FirebaseConstants.KEY}`,
  project_id: FirebaseConstants.SENDER_ID,
});

export const mergeurlQuery = (urlPath, params) => {
  const urlObj = Url.parse(urlPath, true);
  const mergedQuery = { ...urlObj.query, ...params };
  const query = Object.entries(mergedQuery).filter(
    ([, value]) => (value !== null && value !== undefined)).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }), {});
  urlObj.search = null;
  urlObj.query = query;
  // crashed with {...urlObj, query, search: null}
  return Url.format(urlObj);
};

const req = method => (url, headers, body) => {
  let request;
  if (method === 'GET') {
    request = fetch(mergeurlQuery(url, body), { method, headers });
  } else {
    request = fetch(url, { method, headers, body: JSON.stringify(body) });
  }
  return request.then(
    (resp) => {
      console.log(resp);
      if (resp.status < 200 || resp.status > 299) {
        return new Error(`bad response ${resp.status} ${resp.statusText}`);
      }
      return resp.json();
    })
    .then(response => ({ response }))
    .catch(error => ({ error }));
};

const request = {
  GET: req('GET'),
  POST: req('POST'),
};

const handleResponse = ({ response, error }, actionDescription, isGroup) => {
  if (error) {
    Alert.alert(`Failed to ${actionDescription}, check error log`);
    return {};
  }
  if (isGroup && !response.notification_key) {
    Alert.alert(`Failed to ${actionDescription}, empty notification_key returned`);
    return {};
  }
  return response;
};

const groupOperationConstructor = (operation, method = 'GET', description) =>
  async (groupName, token, groupNotificationKey) => {
    const body = {
      operation,
      notification_key_name: groupName,
      notification_key: groupNotificationKey,
      registration_ids: token && [token],
    };
    console.log('request parameters ', GROUP_URL, { method, headers: GROUP_HEADERS, body });
    const resp = await request[method](GROUP_URL, GROUP_HEADERS, body);
    console.log('resp ', resp);
    const isGroupHandler = true;

    return handleResponse(resp, description, isGroupHandler).notification_key;
  };

export const firebaseGroup = {
  // async functions
  createGroup: groupOperationConstructor('create', 'POST', 'create group with token'),
  add: groupOperationConstructor('add', 'POST', 'add token to group'),
  // if all tokens have removed - group removes automaticially
  remove: groupOperationConstructor('remove', 'POST', 'remove token from group'),
  getKey: groupOperationConstructor(undefined, 'GET', 'get token for group'),
};

export const firebaseClient = {
  send: async (body, type) => {
    if (FirebaseConstants.KEY === 'YOUR_API_KEY') {
      Alert.alert('Set your API_KEY in app/FirebaseConstants.js');
      return null;
    }
    console.log('request parameters ', FCM_URL, { method: 'POST', headers: GROUP_HEADERS, body });
    const resp = await request.POST(FCM_URL, GROUP_HEADERS, body);
    console.log('resp ', resp);
    const isGroupHandler = false;
    return handleResponse(resp, 'send notification', isGroupHandler);
  },
};

// parallel request
async function bestFetch() {
  const first = fetch();
  const two = fetch();
  const firstvalue = await first.json();
  const secondvalue = await two.json();
}
