import type { Transaction } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

// Google OAuth Authentication using GIS
export function requestGoogleAuthToken(clientId: string): Promise<{ accessToken: string; expiresAt: number; name?: string; email?: string; picture?: string }> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      reject(new Error('Google Identity Services script is not loaded. Please refresh the page.'));
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }

          const accessToken = response.access_token;
          const expiresAt = Date.now() + parseInt(response.expires_in) * 1000;

          try {
            // Fetch user profile info
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            if (profileRes.ok) {
              const profile = await profileRes.json();
              resolve({
                accessToken,
                expiresAt,
                name: profile.name,
                email: profile.email,
                picture: profile.picture
              });
            } else {
              resolve({ accessToken, expiresAt });
            }
          } catch {
            resolve({ accessToken, expiresAt });
          }
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(new Error(err.message || 'OAuth init failed'));
    }
  });
}

// Drive and Sheets REST queries
export async function findOrCreateSpreadsheet(accessToken: string): Promise<{ spreadsheetId: string; url: string }> {
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='WealthFlow Finance Tracker' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,webViewLink)`;
  
  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!searchResponse.ok) {
    let errorDetail = '';
    try {
      const errJson = await searchResponse.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetail = await searchResponse.text();
      } catch {
        errorDetail = 'Unknown transport error';
      }
    }
    throw new Error(`Google Drive API: ${searchResponse.status} - ${errorDetail}`);
  }

  const searchResult = await searchResponse.json();

  if (searchResult.files && searchResult.files.length > 0) {
    return {
      spreadsheetId: searchResult.files[0].id,
      url: searchResult.files[0].webViewLink
    };
  }

  // Create a new sheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: 'WealthFlow Finance Tracker'
      }
    })
  });

  if (!createResponse.ok) {
    let errorDetail = '';
    try {
      const errJson = await createResponse.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetail = await createResponse.text();
      } catch {
        errorDetail = 'Unknown transport error';
      }
    }
    throw new Error(`Google Sheets Create API: ${createResponse.status} - ${errorDetail}`);
  }

  const newSheet = await createResponse.json();
  const spreadsheetId = newSheet.spreadsheetId;
  const url = newSheet.spreadsheetUrl;

  // Initialize the headers
  const appendResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:F1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [['ID', 'Date', 'Type', 'Category', 'Amount', 'Description']]
    })
  });

  if (!appendResponse.ok) {
    let errorDetail = '';
    try {
      const errJson = await appendResponse.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetail = await appendResponse.text();
      } catch {
        errorDetail = 'Unknown transport error';
      }
    }
    throw new Error(`Google Sheets Append API: ${appendResponse.status} - ${errorDetail}`);
  }

  return { spreadsheetId, url };
}

export async function fetchTransactionsFromSheet(spreadsheetId: string, accessToken: string): Promise<Transaction[]> {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:F1000`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = 'Unknown transport error';
      }
    }
    throw new Error(`Google Sheets Read API: ${response.status} - ${errorDetail}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  return rows.map((row: any) => ({
    id: row[0] || Math.random().toString(36).substring(2, 9),
    date: row[1] || '',
    type: (row[2] as 'income' | 'expense') || 'expense',
    category: row[3] || '',
    amount: parseFloat(row[4]) || 0,
    description: row[5] || '',
    synced: true
  }));
}

export async function appendTransactionsToSheet(spreadsheetId: string, transactions: Transaction[], accessToken: string): Promise<void> {
  const values = transactions.map(t => [
    t.id,
    t.date,
    t.type,
    t.category,
    t.amount,
    t.description
  ]);

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:F2:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = 'Unknown transport error';
      }
    }
    throw new Error(`Google Sheets Sync API: ${response.status} - ${errorDetail}`);
  }
}
