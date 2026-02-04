import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardBody } from '@material-tailwind/react';
import { FaGoogleDrive } from 'react-icons/fa';

const GoogleDriveTest = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const GOOGLE_CLIENT_ID = '109529451585-depk4cluokih0bn74ruc4oej9j8t4oh4.apps.googleusercontent.com';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  useEffect(() => {
    loadGoogleIdentityServices();
  }, []);

  const loadGoogleIdentityServices = () => {
    if (!window.google || !window.google.accounts) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        console.log('Google Identity Services loaded');
        setIsLoaded(true);
        setError(null);
      };
      script.onerror = () => {
        setError('Failed to load Google Identity Services');
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  };

  const testAuthentication = () => {
    if (!window.google || !window.google.accounts) {
      setError('Google Identity Services not loaded');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('Authentication failed:', response.error);
          setError(response.error);
        } else {
          console.log('Authentication successful:', response);
          setToken(response.access_token);
          setError(null);
        }
      }
    });

    client.requestAccessToken();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardBody className="p-6">
        <div className="text-center mb-6">
          <FaGoogleDrive className="text-4xl text-blue-500 mx-auto mb-4" />
          <Typography className="text-xl font-semibold">
            Google Drive Test
          </Typography>
        </div>

        <div className="space-y-4">
          <div>
            <Typography className="text-sm text-gray-600">
              Status: {isLoaded ? '✅ Loaded' : '❌ Not Loaded'}
            </Typography>
            <Typography className="text-sm text-gray-600">
              Token: {token ? '✅ Authenticated' : '❌ Not Authenticated'}
            </Typography>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <Typography className="text-sm text-red-800">
                Error: {error}
              </Typography>
            </div>
          )}

          <Button
            onClick={testAuthentication}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <FaGoogleDrive className="text-sm" />
            Test Authentication
          </Button>

          {token && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <Typography className="text-sm text-green-800">
                ✅ Authentication successful! Token received.
              </Typography>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default GoogleDriveTest;
