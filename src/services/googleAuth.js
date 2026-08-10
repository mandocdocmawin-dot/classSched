// googleAuth.js
let tokenClient = null;

export function initGoogleAuth(onTokenReceived) {
  if (!window.google || !window.google.accounts) {
    setTimeout(() => initGoogleAuth(onTokenReceived), 200);
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    hosted_domain: "student.laverdad.edu.ph",
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error("Auth error:", tokenResponse);
        return;
      }
      onTokenReceived(tokenResponse.access_token);
    },
  });
}

export function signIn() {
  if (!tokenClient) {
    console.error("Google Auth has not been initialized yet.");
    return;
  }
  tokenClient.requestAccessToken();
}

export function refreshToken() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: "" });
}

export async function verifyEduAndFetchSheet(accessToken) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_SPREADSHEET_ID}/values/BSIS!A1:A1`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  return res.json();
}