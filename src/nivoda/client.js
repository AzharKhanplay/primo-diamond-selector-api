import { config } from '../config.js';

const AUTH_QUERY = `
  query Auth($username: String!, $password: String!) {
    authenticate {
      username_and_password(username: $username, password: $password) {
        token
        expires
      }
    }
  }
`;

let cachedToken = null;
let cachedTokenExpires = 0;

async function graphql(query, variables, { useAuth = true } = {}) {
  const { apiUrl, username, password } = config.nivoda;
  if (!apiUrl) {
    const error = new Error('NIVODA_API_URL is not configured');
    error.status = 503;
    throw error;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (useAuth && cachedToken) {
    headers.Authorization = `Bearer ${cachedToken}`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables: variables || {} }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.errors?.[0]?.message || `Nivoda API returned ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (payload.errors?.length) {
    const error = new Error(payload.errors[0].message || 'Nivoda GraphQL error');
    error.status = 502;
    throw error;
  }

  return payload.data;
}

export async function authenticate() {
  const now = Date.now();
  if (cachedToken && cachedTokenExpires > now + 60_000) {
    return cachedToken;
  }

  const { username, password } = config.nivoda;
  const data = await graphql(
    AUTH_QUERY,
    { username, password },
    { useAuth: false }
  );

  const session = data?.authenticate?.username_and_password;
  if (!session?.token) {
    const error = new Error('Nivoda authentication failed');
    error.status = 401;
    throw error;
  }

  cachedToken = session.token;
  cachedTokenExpires = Number(session.expires) || now + 3_600_000;
  return cachedToken;
}

export async function nivodaGraphql(query, variables) {
  await authenticate();
  return graphql(query, variables, { useAuth: true });
}

export function clearNivodaAuthCache() {
  cachedToken = null;
  cachedTokenExpires = 0;
}
