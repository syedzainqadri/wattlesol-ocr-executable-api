/**
 * WattleSol OCR - Executable API
 * High-Performance OCR Processing for Production Use
 *
 * DEPLOYMENT: Deploy as Executable API (not Web App)
 * PERFORMANCE: 3-5 seconds vs 10-19 seconds for Web App
 *
 * Required APIs:
 * - Google Drive API (Advanced)
 * - Google Docs API (Advanced)
 */

// Enable V8 Runtime for better performance

/**
 * Web App endpoint for testing (doGet function)
 * This allows testing via web app URL for performance comparison
 */
function doGet(e) {
  try {
    // Test endpoint
    if (e.parameter.test === 'true') {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'WattleSol OCR Executable API is working!',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          performance: 'OPTIMIZED',
          parameters: e.parameter
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // OCR processing via URL
    if (e.parameter.action === 'testOCR' && e.parameter.imageUrl) {
      const startTime = new Date().getTime();

      try {
        const result = processImageFromURL(
          e.parameter.imageUrl,
          e.parameter.ocrLang || 'en',
          e.parameter.ocrSecret === 'on'
        );

        const processingTime = new Date().getTime() - startTime;

        return ContentService
          .createTextOutput(JSON.stringify({
            success: result.success,
            text: result.text,
            fileId: result.fileId,
            fileName: result.fileName,
            processingTime: processingTime,
            language: e.parameter.ocrLang || 'en',
            method: 'WEB_APP_OPTIMIZED',
            timestamp: new Date().toISOString()
          }))
          .setMimeType(ContentService.MimeType.JSON);

      } catch (error) {
        const processingTime = new Date().getTime() - startTime;

        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            error: error.toString(),
            processingTime: processingTime,
            method: 'WEB_APP_OPTIMIZED',
            timestamp: new Date().toISOString()
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Default response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid request. Use ?test=true or ?action=testOCR&imageUrl=URL',
        availableEndpoints: [
          '?test=true - Test connection',
          '?action=testOCR&imageUrl=URL&ocrLang=en&ocrSecret=off - Process OCR'
        ]
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main OCR function for URL-based image processing
 * Optimized for executable API deployment
 */
function processImageFromURL(imageUrl, ocrLanguage = 'DefaultLang', isSecret = false) {
  const startTime = new Date().getTime();
  
  try {
    // Validate input
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    // Fetch image with optimized settings
    const response = UrlFetchApp.fetch(imageUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
      headers: {
        'User-Agent': 'WattleSol-OCR-Bot/1.0'
      }
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to fetch image: HTTP ${response.getResponseCode()}`);
    }
    
    const blob = response.getBlob();
    
    // Validate image type
    const contentType = blob.getContentType();
    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid file type: ${contentType}. Only images are supported.`);
    }
    
    // Process OCR with optimized settings
    const ocrResult = performOCR(blob, ocrLanguage, isSecret);
    
    const processingTime = new Date().getTime() - startTime;
    
    return {
      success: true,
      text: ocrResult.text,
      fileId: ocrResult.fileId,
      fileName: ocrResult.fileName,
      processingTime: processingTime,
      language: ocrLanguage,
      method: 'EXECUTABLE_API'
    };
    
  } catch (error) {
    const processingTime = new Date().getTime() - startTime;
    
    return {
      success: false,
      error: error.toString(),
      processingTime: processingTime,
      method: 'EXECUTABLE_API'
    };
  }
}

/**
 * Main OCR function for base64 file upload
 * Optimized for executable API deployment
 */
function processImageFromBase64(base64Data, fileName, mimeType, ocrLanguage = 'DefaultLang', isSecret = false) {
  const startTime = new Date().getTime();
  
  try {
    // Validate input
    if (!base64Data) {
      throw new Error('Base64 data is required');
    }
    
    // Create blob from base64
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      fileName
    );
    
    // Validate image type
    if (!mimeType.startsWith('image/')) {
      throw new Error(`Invalid file type: ${mimeType}. Only images are supported.`);
    }
    
    // Process OCR with optimized settings
    const ocrResult = performOCR(blob, ocrLanguage, isSecret);
    
    const processingTime = new Date().getTime() - startTime;
    
    return {
      success: true,
      text: ocrResult.text,
      fileId: ocrResult.fileId,
      fileName: ocrResult.fileName,
      processingTime: processingTime,
      language: ocrLanguage,
      method: 'EXECUTABLE_API'
    };
    
  } catch (error) {
    const processingTime = new Date().getTime() - startTime;
    
    return {
      success: false,
      error: error.toString(),
      processingTime: processingTime,
      method: 'EXECUTABLE_API'
    };
  }
}

/**
 * Core OCR processing function
 * Optimized for speed and reliability
 */
function performOCR(blob, ocrLanguage, isSecret) {
  try {
    // Prepare file resource
    const resource = {
      title: blob.getName(),
      mimeType: blob.getContentType(),
      parents: isSecret ? [] : [getOCRFolder()]
    };
    
    // Perform OCR with Drive API
    let fileId;
    if (ocrLanguage === "DefaultLang" || ocrLanguage === "MultiLang") {
      fileId = Drive.Files.insert(resource, blob, {
        ocr: true,
        convert: true
      }).id;
    } else {
      fileId = Drive.Files.insert(resource, blob, {
        ocr: true,
        convert: true,
        ocrLanguage: ocrLanguage
      }).id;
    }
    
    // Wait for OCR processing to complete
    Utilities.sleep(1000);
    
    // Extract text from Google Doc
    const doc = DocumentApp.openById(fileId);
    const text = doc.getBody().getText();
    
    // Clean up if secret file
    if (isSecret) {
      Drive.Files.remove(fileId);
    }
    
    return {
      text: text,
      fileId: isSecret ? 'DELETED' : fileId,
      fileName: blob.getName()
    };
    
  } catch (error) {
    throw new Error(`OCR processing failed: ${error.toString()}`);
  }
}

/**
 * Get or create OCR folder for file organization
 */
function getOCRFolder() {
  const folderName = 'WattleSol OCR Results';
  
  try {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next().getId();
    } else {
      const folder = DriveApp.createFolder(folderName);
      return folder.getId();
    }
  } catch (error) {
    // Return root folder if creation fails
    return DriveApp.getRootFolder().getId();
  }
}

/**
 * Test function for API connectivity
 */
function testConnection() {
  return {
    success: true,
    message: 'WattleSol OCR Executable API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    performance: 'OPTIMIZED'
  };
}
