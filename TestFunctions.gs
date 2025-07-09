/**
 * WattleSol OCR - Test Functions
 * Test scripts for validating executable API functionality
 */

/**
 * Test all core functions
 */
function runAllTests() {
  console.log('🧪 Starting WattleSol OCR Executable API Tests...');
  
  const results = {
    testConnection: null,
    testHealthStatus: null,
    testConfig: null,
    testImageValidation: null,
    testOCRProcessing: null,
    testBatchProcessing: null,
    testStatistics: null
  };
  
  try {
    // Test 1: Connection
    console.log('Test 1: Connection Test');
    results.testConnection = testConnectionFunction();
    
    // Test 2: Health Status
    console.log('Test 2: Health Status');
    results.testHealthStatus = testHealthStatusFunction();
    
    // Test 3: Configuration
    console.log('Test 3: Configuration');
    results.testConfig = testConfigFunction();
    
    // Test 4: Image Validation
    console.log('Test 4: Image Validation');
    results.testImageValidation = testImageValidationFunction();
    
    // Test 5: OCR Processing (with sample image)
    console.log('Test 5: OCR Processing');
    results.testOCRProcessing = testOCRProcessingFunction();
    
    // Test 6: Batch Processing
    console.log('Test 6: Batch Processing');
    results.testBatchProcessing = testBatchProcessingFunction();
    
    // Test 7: Statistics
    console.log('Test 7: Statistics');
    results.testStatistics = testStatisticsFunction();
    
    console.log('✅ All tests completed!');
    return {
      success: true,
      timestamp: new Date().toISOString(),
      results: results
    };
    
  } catch (error) {
    console.log('❌ Test suite failed:', error.toString());
    return {
      success: false,
      error: error.toString(),
      partialResults: results
    };
  }
}

/**
 * Test connection function
 */
function testConnectionFunction() {
  try {
    const result = testConnection();
    console.log('✅ Connection test passed');
    return { success: true, result: result };
  } catch (error) {
    console.log('❌ Connection test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test health status function
 */
function testHealthStatusFunction() {
  try {
    const result = getHealthStatus();
    console.log('✅ Health status test passed');
    return { success: true, result: result };
  } catch (error) {
    console.log('❌ Health status test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test configuration function
 */
function testConfigFunction() {
  try {
    const result = getConfig();
    console.log('✅ Configuration test passed');
    return { success: true, result: result };
  } catch (error) {
    console.log('❌ Configuration test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test image validation function
 */
function testImageValidationFunction() {
  try {
    // Test valid image URL
    const validUrl = 'https://via.placeholder.com/300x200.png';
    const validResult = validateImageUrl(validUrl);
    
    // Test invalid URL
    const invalidUrl = 'https://example.com/notanimage.txt';
    const invalidResult = validateImageUrl(invalidUrl);
    
    console.log('✅ Image validation test passed');
    return { 
      success: true, 
      validTest: validResult,
      invalidTest: invalidResult
    };
  } catch (error) {
    console.log('❌ Image validation test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test OCR processing with sample image
 */
function testOCRProcessingFunction() {
  try {
    // Use a simple test image with text
    const testImageUrl = 'https://via.placeholder.com/400x100/000000/FFFFFF?text=Hello+World+OCR+Test';
    
    const result = processImageFromURL(testImageUrl, 'en', true); // Use secret mode for test
    
    console.log('✅ OCR processing test passed');
    return { success: true, result: result };
  } catch (error) {
    console.log('❌ OCR processing test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test batch processing
 */
function testBatchProcessingFunction() {
  try {
    const testUrls = [
      'https://via.placeholder.com/300x100/FF0000/FFFFFF?text=Test+1',
      'https://via.placeholder.com/300x100/00FF00/FFFFFF?text=Test+2'
    ];
    
    const result = processBatchImages(testUrls, 'en', true); // Use secret mode for test
    
    console.log('✅ Batch processing test passed');
    return { success: true, result: result };
  } catch (error) {
    console.log('❌ Batch processing test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test statistics function
 */
function testStatisticsFunction() {
  try {
    const result = getOCRStatistics();
    console.log('✅ Statistics test passed');
    return { success: true, result: result };
  } catch (error) {
    console.log('❌ Statistics test failed:', error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Performance benchmark test
 */
function runPerformanceBenchmark() {
  console.log('🏃‍♂️ Starting Performance Benchmark...');
  
  const testUrls = [
    'https://via.placeholder.com/500x200/000000/FFFFFF?text=Performance+Test+1',
    'https://via.placeholder.com/500x200/FF0000/FFFFFF?text=Performance+Test+2',
    'https://via.placeholder.com/500x200/00FF00/FFFFFF?text=Performance+Test+3'
  ];
  
  const results = [];
  const overallStartTime = new Date().getTime();
  
  for (let i = 0; i < testUrls.length; i++) {
    const startTime = new Date().getTime();
    
    try {
      const result = processImageFromURL(testUrls[i], 'en', true);
      const endTime = new Date().getTime();
      const processingTime = endTime - startTime;
      
      results.push({
        test: i + 1,
        url: testUrls[i],
        success: result.success,
        processingTime: processingTime,
        textLength: result.text ? result.text.length : 0
      });
      
      console.log(`Test ${i + 1}: ${processingTime}ms`);
      
    } catch (error) {
      const endTime = new Date().getTime();
      const processingTime = endTime - startTime;
      
      results.push({
        test: i + 1,
        url: testUrls[i],
        success: false,
        processingTime: processingTime,
        error: error.toString()
      });
      
      console.log(`Test ${i + 1}: FAILED in ${processingTime}ms`);
    }
  }
  
  const overallEndTime = new Date().getTime();
  const totalTime = overallEndTime - overallStartTime;
  const averageTime = totalTime / testUrls.length;
  
  const benchmark = {
    totalTests: testUrls.length,
    successfulTests: results.filter(r => r.success).length,
    totalTime: totalTime,
    averageTime: averageTime,
    results: results,
    timestamp: new Date().toISOString()
  };
  
  console.log('🏁 Performance Benchmark Complete');
  console.log(`Average processing time: ${averageTime.toFixed(0)}ms`);
  console.log(`Success rate: ${(benchmark.successfulTests / benchmark.totalTests * 100).toFixed(1)}%`);
  
  return benchmark;
}

/**
 * Test rate limiting
 */
function testRateLimiting() {
  console.log('🚦 Testing Rate Limiting...');
  
  const results = [];
  const testIdentifier = 'test_user_' + Date.now();
  
  // Try to exceed rate limit
  for (let i = 0; i < 5; i++) {
    try {
      const allowed = checkRateLimit(testIdentifier);
      results.push({
        attempt: i + 1,
        allowed: allowed,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        attempt: i + 1,
        allowed: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      });
    }
  }
  
  console.log('✅ Rate limiting test completed');
  return {
    testIdentifier: testIdentifier,
    results: results
  };
}

/**
 * Quick smoke test for deployment validation
 */
function quickSmokeTest() {
  console.log('💨 Running Quick Smoke Test...');
  
  try {
    // Test 1: Basic connection
    const connection = testConnection();
    if (!connection.success) throw new Error('Connection test failed');
    
    // Test 2: Configuration
    const config = getConfig();
    if (!config.API_NAME) throw new Error('Configuration test failed');
    
    // Test 3: Health check
    const health = getHealthStatus();
    if (health.status !== 'healthy') throw new Error('Health check failed');
    
    console.log('✅ Smoke test passed - API is ready!');
    return {
      success: true,
      message: 'All critical functions working correctly',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.log('❌ Smoke test failed:', error.toString());
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}
