// services/amadeusAuth.ts

let accessToken: string | null = null;
let tokenExpiry: number = 0; // timestamp in milliseconds

export async function getAmadeusAccessToken(): Promise<string> {
  const now = Date.now();

  if (accessToken && now < tokenExpiry) {
    return accessToken!;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.AMADEUS_CLIENT_ID || '',
    client_secret: process.env.AMADEUS_CLIENT_SECRET || '',
  });

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Amadeus access token');
  }

  const data = await response.json();

  accessToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000) - 60000; // 1 minute buffer

  return accessToken!;
}