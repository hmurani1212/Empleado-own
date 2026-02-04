// Google Drive API Service
class GoogleDriveService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY';
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
    this.discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    this.scopes = 'https://www.googleapis.com/auth/drive.readonly';
    this.isLoaded = false;
    this.oauthToken = null;
  }

  // Initialize Google API
  async initialize() {
    if (this.isLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          window.gapi.load('client:picker', () => {
            this.loadClient().then(resolve).catch(reject);
          });
        };
        script.onerror = () => reject(new Error('Failed to load Google API script'));
        document.head.appendChild(script);
      } else {
        this.loadClient().then(resolve).catch(reject);
      }
    });
  }

  // Load Google API client
  async loadClient() {
    try {
      await window.gapi.client.init({
        apiKey: this.apiKey,
        discoveryDocs: [this.discoveryDoc],
      });
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading Google API client:', error);
      
      // Handle 502 errors specifically
      if (error.status === 502) {
        throw new Error('Google Drive API is temporarily unavailable. Please try again in a few minutes.');
      }
      
      // Handle other API errors
      if (error.status === 403) {
        throw new Error('Google Drive API access denied. Please check your API key.');
      }
      
      if (error.status === 400) {
        throw new Error('Invalid API request. Please check your configuration.');
      }
      
      throw error;
    }
  }

  // Authenticate user
  async authenticate() {
    if (!this.isLoaded) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        // Initialize auth2 if not already done
        window.gapi.auth2.init({
          client_id: this.clientId,
          scope: this.scopes
        }).then(() => {
          this.performAuth().then(resolve).catch(reject);
        }).catch(reject);
      } else {
        this.performAuth().then(resolve).catch(reject);
      }
    });
  }

  // Perform authentication
  async performAuth() {
    return new Promise((resolve, reject) => {
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      authInstance.signIn({
        scope: this.scopes
      }).then(() => {
        const user = authInstance.currentUser.get();
        this.oauthToken = user.getAuthResponse().access_token;
        resolve(this.oauthToken);
      }).catch((error) => {
        console.error('Authentication failed:', error);
        reject(error);
      });
    });
  }

  // Create and show file picker
  createPicker(options = {}) {
    if (!this.isLoaded || !this.oauthToken) {
      throw new Error('Google API not initialized or user not authenticated');
    }

    const {
      allowedFileTypes = ['all'],
      multiple = false,
      title = 'Select Files from Google Drive',
      onFileSelect = () => {},
      onCancel = () => {}
    } = options;

    // Create view based on file types
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
    
    if (allowedFileTypes.includes('images')) {
      view.setMimeTypes('image/jpeg,image/png,image/gif,image/bmp,image/webp,image/svg+xml');
    } else if (allowedFileTypes.includes('videos')) {
      view.setMimeTypes('video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,video/mkv');
    } else if (allowedFileTypes.includes('documents')) {
      view.setMimeTypes('application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain');
    }

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(this.oauthToken)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const files = data.docs.map(file => this.processFile(file));
          onFileSelect(files);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          onCancel();
        }
      })
      .setTitle(title)
      .setOrigin(window.location.protocol + '//' + window.location.host)
      .build();

    picker.setVisible(true);
    return picker;
  }

  // Process file data
  processFile(file) {
    return {
      id: file.id,
      name: file.name,
      url: `https://drive.google.com/file/d/${file.id}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
      mimeType: file.mimeType,
      size: file.sizeBytes,
      thumbnailUrl: file.thumbnailUrl,
      iconUrl: file.iconUrl,
      type: this.getFileType(file.mimeType),
      isGoogleDrive: true
    };
  }

  // Get file type from MIME type
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.includes('presentation')) return 'presentation';
    return 'file';
  }

  // Get file icon based on type
  getFileIcon(type) {
    const iconMap = {
      image: '🖼️',
      video: '🎥',
      pdf: '📄',
      document: '📝',
      spreadsheet: '📊',
      presentation: '📽️',
      file: '📁'
    };
    return iconMap[type] || iconMap.file;
  }

  // Validate Google Drive URL
  validateDriveUrl(url) {
    const drivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /^https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)\/edit/,
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)\/edit/,
      /^https:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)\/edit/
    ];
    
    for (const pattern of drivePatterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          isValid: true,
          fileId: match[1]
        };
      }
    }
    
    return { isValid: false, fileId: null };
  }

  // Extract file ID from Google Drive URL
  extractFileId(url) {
    const validation = this.validateDriveUrl(url);
    return validation.isValid ? validation.fileId : null;
  }

  // Get file metadata from Google Drive
  async getFileMetadata(fileId) {
    if (!this.isLoaded || !this.oauthToken) {
      throw new Error('Google API not initialized or user not authenticated');
    }

    try {
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,size,thumbnailLink,iconLink,webViewLink'
      });

      return this.processFile(response.result);
    } catch (error) {
      console.error('Error fetching file metadata:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.isLoaded && this.oauthToken !== null;
  }

  // Sign out user
  signOut() {
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut();
        this.oauthToken = null;
      }
    }
  }
}

// Create singleton instance
const googleDriveService = new GoogleDriveService();

export default googleDriveService;
