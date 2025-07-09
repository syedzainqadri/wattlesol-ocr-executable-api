/**
 * WattleSol OCR - Configuration & Settings
 * Configuration for executable API deployment
 */

/**
 * API Configuration Constants
 */
const CONFIG = {
  // API Information
  API_NAME: 'WattleSol OCR Executable API',
  API_VERSION: '1.0.0',
  API_DESCRIPTION: 'High-performance OCR processing for production use',
  
  // Performance Settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  BATCH_SIZE: 5,
  PROCESSING_TIMEOUT: 30000, // 30 seconds
  
  // OCR Settings
  DEFAULT_LANGUAGE: 'DefaultLang',
  SUPPORTED_LANGUAGES: [
    'DefaultLang',
    'MultiLang',
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
    'ar', 'hi', 'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'da', 'no'
  ],
  
  // File Management
  FOLDER_NAME: 'WattleSol OCR Results',
  AUTO_CLEANUP_DAYS: 30,
  
  // Security
  ALLOWED_DOMAINS: [], // Empty array means all domains allowed
  RATE_LIMIT_PER_MINUTE: 60,
  
  // Error Messages
  ERRORS: {
    INVALID_URL: 'Invalid or inaccessible image URL',
    INVALID_FILE_TYPE: 'Only image files are supported',
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    PROCESSING_FAILED: 'OCR processing failed',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    UNAUTHORIZED_DOMAIN: 'Domain not authorized'
  }
};

/**
 * Get API configuration
 */
function getConfig() {
  return CONFIG;
}

/**
 * Validate file size
 */
function validateFileSize(blob) {
  const size = blob.getBytes().length;
  
  if (size > CONFIG.MAX_FILE_SIZE) {
    throw new Error(`${CONFIG.ERRORS.FILE_TOO_LARGE} (${Math.round(size / 1024 / 1024)}MB > ${Math.round(CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB)`);
  }
  
  return true;
}

/**
 * Validate OCR language
 */
function validateLanguage(language) {
  if (!language) {
    return CONFIG.DEFAULT_LANGUAGE;
  }
  
  if (!CONFIG.SUPPORTED_LANGUAGES.includes(language)) {
    console.log(`Unsupported language: ${language}, using default`);
    return CONFIG.DEFAULT_LANGUAGE;
  }
  
  return language;
}

/**
 * Check domain authorization (if enabled)
 */
function validateDomain(url) {
  if (CONFIG.ALLOWED_DOMAINS.length === 0) {
    return true; // All domains allowed
  }
  
  try {
    const domain = new URL(url).hostname;
    return CONFIG.ALLOWED_DOMAINS.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Rate limiting (basic implementation)
 */
function checkRateLimit(identifier = 'default') {
  try {
    const cache = CacheService.getScriptCache();
    const key = `rate_limit_${identifier}`;
    const currentMinute = Math.floor(Date.now() / 60000);
    const cacheKey = `${key}_${currentMinute}`;
    
    const currentCount = parseInt(cache.get(cacheKey) || '0');
    
    if (currentCount >= CONFIG.RATE_LIMIT_PER_MINUTE) {
      throw new Error(CONFIG.ERRORS.RATE_LIMIT_EXCEEDED);
    }
    
    cache.put(cacheKey, (currentCount + 1).toString(), 60);
    return true;
    
  } catch (error) {
    // If cache fails, allow the request
    console.log('Rate limit check failed:', error.toString());
    return true;
  }
}

/**
 * Log API usage for monitoring
 */
function logAPIUsage(operation, success, processingTime, details = {}) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: operation,
      success: success,
      processingTime: processingTime,
      details: details
    };
    
    // Log to console for now
    console.log('API Usage:', JSON.stringify(logEntry));
    
    // In production, you might want to log to a spreadsheet or external service
    // logToSpreadsheet(logEntry);
    
  } catch (error) {
    console.log('Failed to log API usage:', error.toString());
  }
}

/**
 * Get API health status
 */
function getHealthStatus() {
  try {
    const startTime = new Date().getTime();
    
    // Test Drive API access
    const driveTest = testDriveAPI();
    
    // Test Docs API access
    const docsTest = testDocsAPI();
    
    // Test folder access
    const folderTest = testFolderAccess();
    
    const responseTime = new Date().getTime() - startTime;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: responseTime,
      services: {
        driveAPI: driveTest,
        docsAPI: docsTest,
        folderAccess: folderTest
      },
      config: {
        version: CONFIG.API_VERSION,
        maxFileSize: CONFIG.MAX_FILE_SIZE,
        supportedLanguages: CONFIG.SUPPORTED_LANGUAGES.length
      }
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
  }
}

/**
 * Test Drive API access
 */
function testDriveAPI() {
  try {
    Drive.About.get();
    return { status: 'ok', message: 'Drive API accessible' };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Test Docs API access
 */
function testDocsAPI() {
  try {
    // Try to access DocumentApp
    DocumentApp.create('Test Doc').setTrashed(true);
    return { status: 'ok', message: 'Docs API accessible' };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Test folder access
 */
function testFolderAccess() {
  try {
    const folder = getOCRFolder();
    return { 
      status: 'ok', 
      message: 'Folder access working',
      folderId: folder
    };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}
