import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, Card, CardBody } from '@material-tailwind/react';
import { FaGoogleDrive, FaTimes, FaFile, FaImage, FaVideo, FaFilePdf } from 'react-icons/fa';
import { showToast } from '../Toaster/Toaster';

const GoogleDrivePicker = ({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  allowedFileTypes = ['all'], // ['all', 'images', 'videos', 'documents']
  multiple = false,
  title = "Select Files from Google Drive"
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);
  const pickerApiLoaded = useRef(false);
  const oauthToken = useRef(null);
////AIzaSyD_Z07fr_mKKX-8WDCXC_uZrauXl68y9bI
  // Google Drive API configuration  109529451585-depk4cluokih0bn74ruc4oej9j8t4oh4.apps.googleusercontent.com
  const GOOGLE_API_KEY = 'AIzaSyD_Z07fr_mKKX-8WDCXC_uZrauXl68y9bI';
  const GOOGLE_CLIENT_ID = '20220648456-1afrulra0gos0pfr622u90m4a8bvvms3.apps.googleusercontent.com';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  useEffect(() => {
    if (isOpen && !isLoaded) {
      loadGoogleDriveAPI();
    }
  }, [isOpen, isLoaded]);

  const loadGoogleDriveAPI = () => {
    // Load Google Identity Services and API script
    if (!window.google || !window.google.accounts) {
      // Load Google Identity Services first
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = () => {
        // Then load the API script
        if (!window.gapi) {
          const apiScript = document.createElement('script');
          apiScript.src = 'https://apis.google.com/js/api.js';
          apiScript.onload = () => {
            window.gapi.load('client:picker', initializePicker);
          };
          document.head.appendChild(apiScript);
        } else {
          initializePicker();
        }
      };
      document.head.appendChild(gisScript);
    } else if (!window.gapi) {
      const apiScript = document.createElement('script');
      apiScript.src = 'https://apis.google.com/js/api.js';
      apiScript.onload = () => {
        window.gapi.load('client:picker', initializePicker);
      };
      document.head.appendChild(apiScript);
    } else {
      initializePicker();
    }
  };

  const initializePicker = () => {
    // Initialize the client without Auth2 (using new Google Identity Services)
    window.gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      discoveryDocs: [DISCOVERY_DOC]
    }).then(() => {
      console.log('Google API client initialized successfully');
      setIsLoaded(true);
      pickerApiLoaded.current = true;
      setError(null);
    }).catch((error) => {
      console.error('Error loading Google API:', error);
      
      // Handle specific error types
      if (error.status === 502) {
        const errorMessage = 'Google Drive API is temporarily unavailable. Please try again in a few minutes.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        
        // Auto-retry for 502 errors after 30 seconds
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            initializePicker();
          }, 30000);
        }
      } else if (error.status === 403) {
        const errorMessage = 'Google Drive API access denied. Please check your API key configuration.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } else if (error.status === 400) {
        const errorMessage = 'Invalid API request. Please check your Google API configuration.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } else {
        const errorMessage = 'Failed to load Google Drive API. Please try again later.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    });
  };

  const authenticate = () => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts) {
        reject(new Error('Google Identity Services not loaded. Please try again.'));
        return;
      }

      // Use the new Google Identity Services
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            console.error('Authentication failed:', response.error);
            reject(new Error(response.error));
          } else {
            oauthToken.current = response.access_token;
            resolve(oauthToken.current);
          }
        }
      });

      client.requestAccessToken();
    });
  };

  const createPicker = () => {
    if (!pickerApiLoaded.current || !oauthToken.current) {
      throw new Error('Google Drive picker not ready. Please try again.');
    }
    
    if (!window.google || !window.google.picker) {
      throw new Error('Google Picker API not loaded. Please try again.');
    }
    
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
    
    // Configure view based on allowed file types
    if (allowedFileTypes.includes('images')) {
      view.setMimeTypes('image/jpeg,image/png,image/gif,image/bmp,image/webp,image/svg+xml');
    } else if (allowedFileTypes.includes('videos')) {
      view.setMimeTypes('video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,video/mkv');
    } else if (allowedFileTypes.includes('documents')) {
      view.setMimeTypes('application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain');
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(oauthToken.current)
      .setCallback(pickerCallback)
      .setTitle(title)
      .setOrigin('http://localhost:3000')
      .build();

    picker.setVisible(true);
    setIsPickerOpen(true);
  };

  const pickerCallback = (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const files = data.docs;
      const processedFiles = files.map(file => ({
        id: file.id,
        name: file.name,
        url: `https://drive.google.com/file/d/${file.id}/view`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
        mimeType: file.mimeType,
        size: file.sizeBytes,
        thumbnailUrl: file.thumbnailUrl,
        iconUrl: file.iconUrl,
        type: getFileType(file.mimeType)
      }));

      if (multiple) {
        setSelectedFiles(prev => [...prev, ...processedFiles]);
      } else {
        setSelectedFiles(processedFiles);
      }

      onFileSelect(processedFiles);
      showToast(`${processedFiles.length} file(s) selected from Google Drive`, 'success');
    } else if (data.action === window.google.picker.Action.CANCEL) {
      setIsPickerOpen(false);
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <FaImage className="text-blue-500" />;
      case 'video': return <FaVideo className="text-red-500" />;
      case 'pdf': return <FaFilePdf className="text-red-600" />;
      case 'document': return <FaFile className="text-green-500" />;
      default: return <FaFile className="text-gray-500" />;
    }
  };

  const handleOpenPicker = async () => {
    try {
      if (!oauthToken.current) {
        await authenticate();
      }
      createPicker();
    } catch (error) {
      console.error('Error opening picker:', error);
      
      if (error.message.includes('not loaded') || error.message.includes('not initialized')) {
        showToast('Google Drive is not ready yet. Please wait a moment and try again.', 'error');
        // Try to reinitialize
        setTimeout(() => {
          initializePicker();
        }, 2000);
      } else if (error.message.includes('popup_blocked')) {
        showToast('Please allow popups for this site to use Google Drive picker.', 'error');
      } else if (error.message.includes('access_denied')) {
        showToast('Access denied. Please try again and grant permission.', 'error');
      } else {
        showToast('Failed to open Google Drive picker. Please try again.', 'error');
      }
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleConfirm = () => {
    if (selectedFiles.length > 0) {
      onFileSelect(selectedFiles);
      onClose();
    } else {
      showToast('Please select at least one file', 'error');
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardBody className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FaGoogleDrive className="text-2xl text-blue-500" />
              <Typography className="text-[18px] font-semibold text-[#474747]">
                {title}
              </Typography>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="text-[18px]" />
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Typography className="text-[14px] text-blue-800 mb-2">
              <strong>Instructions:</strong>
            </Typography>
            <ul className="text-[13px] text-blue-700 space-y-1">
              <li>• Click "Open Google Drive" to access your files</li>
              <li>• Select files from your Google Drive</li>
              <li>• Files will be automatically added to your course resources</li>
              <li>• Supported file types: {allowedFileTypes.join(', ')}</li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Typography className="text-[14px] text-red-800 mb-2">
                {error}
              </Typography>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setRetryCount(0);
                    setError(null);
                    setIsLoaded(false);
                    pickerApiLoaded.current = false;
                    initializePicker();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-[12px]"
                >
                  Retry Now
                </Button>
                <Button
                  onClick={() => {
                    setError(null);
                    setRetryCount(0);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-[12px]"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Open Picker Button */}
          <div className="mb-6">
            <Button
              onClick={handleOpenPicker}
              disabled={!isLoaded || !!error}
              className="w-full flex items-center justify-center gap-3 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogleDrive className="text-[16px]" />
              {isLoaded ? 'Open Google Drive' : 'Loading Google Drive API...'}
            </Button>
            
            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-500">
                <div>API Key: {GOOGLE_API_KEY ? 'Set' : 'Missing'}</div>
                <div>Client ID: {GOOGLE_CLIENT_ID ? 'Set' : 'Missing'}</div>
                <div>Loaded: {isLoaded ? 'Yes' : 'No'}</div>
                <div>Error: {error ? 'Yes' : 'No'}</div>
              </div>
            )}
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <Typography className="text-[16px] font-semibold text-[#474747] mb-3">
                Selected Files ({selectedFiles.length})
              </Typography>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <Typography className="text-[14px] font-medium text-[#474747]">
                          {file.name}
                        </Typography>
                        <Typography className="text-[12px] text-gray-500">
                          {file.type.toUpperCase()} • {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                        </Typography>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTimes className="text-[14px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedFiles.length === 0}
              className="px-6 py-2 bg-[#3DA5F4] text-white rounded-lg hover:bg-[#2B8FD4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Selection ({selectedFiles.length})
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default GoogleDrivePicker;
