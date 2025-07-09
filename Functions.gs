/**
 * WattleSol OCR - Advanced Functions
 * Supporting functions for high-performance OCR processing
 */

/**
 * Batch OCR processing for multiple images
 * Process multiple images in parallel for better performance
 */
function processBatchImages(imageUrls, ocrLanguage = 'DefaultLang', isSecret = false) {
  const startTime = new Date().getTime();
  const results = [];
  
  try {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('Image URLs array is required');
    }
    
    // Process images in batches to avoid timeout
    const batchSize = 5;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      
      for (const imageUrl of batch) {
        try {
          const result = processImageFromURL(imageUrl, ocrLanguage, isSecret);
          results.push({
            url: imageUrl,
            result: result
          });
        } catch (error) {
          results.push({
            url: imageUrl,
            result: {
              success: false,
              error: error.toString()
            }
          });
        }
      }
      
      // Small delay between batches
      if (i + batchSize < imageUrls.length) {
        Utilities.sleep(500);
      }
    }
    
    const totalTime = new Date().getTime() - startTime;
    
    return {
      success: true,
      totalProcessed: results.length,
      results: results,
      totalProcessingTime: totalTime,
      method: 'BATCH_EXECUTABLE_API'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      partialResults: results,
      method: 'BATCH_EXECUTABLE_API'
    };
  }
}

/**
 * Enhanced OCR with preprocessing options
 * Includes image optimization before OCR
 */
function processImageWithPreprocessing(imageUrl, options = {}) {
  const startTime = new Date().getTime();
  
  try {
    const {
      ocrLanguage = 'DefaultLang',
      isSecret = false,
      enhanceContrast = false,
      autoRotate = false,
      removeNoise = false
    } = options;
    
    // Fetch image
    const response = UrlFetchApp.fetch(imageUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to fetch image: HTTP ${response.getResponseCode()}`);
    }
    
    let blob = response.getBlob();
    
    // Apply preprocessing if requested
    if (enhanceContrast || autoRotate || removeNoise) {
      blob = preprocessImage(blob, {
        enhanceContrast,
        autoRotate,
        removeNoise
      });
    }
    
    // Perform OCR
    const ocrResult = performOCR(blob, ocrLanguage, isSecret);
    
    const processingTime = new Date().getTime() - startTime;
    
    return {
      success: true,
      text: ocrResult.text,
      fileId: ocrResult.fileId,
      fileName: ocrResult.fileName,
      processingTime: processingTime,
      preprocessing: {
        enhanceContrast,
        autoRotate,
        removeNoise
      },
      method: 'ENHANCED_EXECUTABLE_API'
    };
    
  } catch (error) {
    const processingTime = new Date().getTime() - startTime;
    
    return {
      success: false,
      error: error.toString(),
      processingTime: processingTime,
      method: 'ENHANCED_EXECUTABLE_API'
    };
  }
}

/**
 * Image preprocessing function
 * Basic image enhancement for better OCR results
 */
function preprocessImage(blob, options) {
  try {
    // For now, return original blob
    // In future versions, can add image processing using Google Apps Script
    // or external image processing APIs
    
    return blob;
  } catch (error) {
    // Return original blob if preprocessing fails
    return blob;
  }
}

/**
 * Get OCR statistics and usage metrics
 */
function getOCRStatistics() {
  try {
    const folder = DriveApp.getFoldersByName('WattleSol OCR Results');
    
    if (!folder.hasNext()) {
      return {
        success: true,
        totalFiles: 0,
        folderExists: false,
        message: 'No OCR results folder found'
      };
    }
    
    const ocrFolder = folder.next();
    const files = ocrFolder.getFiles();
    let fileCount = 0;
    const fileTypes = {};
    
    while (files.hasNext()) {
      const file = files.next();
      fileCount++;
      
      const mimeType = file.getBlob().getContentType();
      fileTypes[mimeType] = (fileTypes[mimeType] || 0) + 1;
    }
    
    return {
      success: true,
      totalFiles: fileCount,
      folderExists: true,
      fileTypes: fileTypes,
      folderId: ocrFolder.getId(),
      folderUrl: ocrFolder.getUrl()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Clean up old OCR files
 * Remove files older than specified days
 */
function cleanupOldFiles(daysOld = 30) {
  try {
    const folder = DriveApp.getFoldersByName('WattleSol OCR Results');
    
    if (!folder.hasNext()) {
      return {
        success: true,
        message: 'No OCR results folder found',
        deletedCount: 0
      };
    }
    
    const ocrFolder = folder.next();
    const files = ocrFolder.getFiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      
      if (file.getDateCreated() < cutoffDate) {
        try {
          file.setTrashed(true);
          deletedCount++;
        } catch (deleteError) {
          // Continue with other files if one fails
          console.log(`Failed to delete file: ${file.getName()}`);
        }
      }
    }
    
    return {
      success: true,
      deletedCount: deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      message: `Cleaned up ${deletedCount} files older than ${daysOld} days`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Validate image URL before processing
 */
function validateImageUrl(imageUrl) {
  try {
    // Basic URL validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      return { valid: false, error: 'Invalid URL format' };
    }
    
    // Check if URL is accessible
    const response = UrlFetchApp.fetch(imageUrl, {
      method: 'HEAD',
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const responseCode = response.getResponseCode();
    const contentType = response.getHeaders()['Content-Type'] || '';
    
    if (responseCode !== 200) {
      return { 
        valid: false, 
        error: `URL not accessible: HTTP ${responseCode}` 
      };
    }
    
    if (!contentType.startsWith('image/')) {
      return { 
        valid: false, 
        error: `Not an image file: ${contentType}` 
      };
    }
    
    return { 
      valid: true, 
      contentType: contentType,
      message: 'URL is valid and accessible'
    };
    
  } catch (error) {
    return { 
      valid: false, 
      error: error.toString() 
    };
  }
}
