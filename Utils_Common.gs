/**
 * @fileoverview Utils_Common - Common Helper Functions
 * 
 * Provides essential utility functions for the Logistics Master Data System including:
 * - Hashing and ID generation (MD5, UUID)
 * - Text processing and normalization for logistics data
 * - Smart naming logic for entity resolution
 * - Geographic calculations (Haversine distance)
 * - System utilities (retry logic, JSON parsing, array operations)
 * - Row adapter helpers for database operations
 * 
 * @version 5.0 Enterprise Edition
 * @author Logistics Development Team
 * @since 2024
 * 
 * @changelog
 * - v5.0: Added comprehensive JSDoc documentation, removed debug functions, improved formatting
 * - v4.0: Added chunkArray() for AI batch processing, enhanced normalizeText() with logistics stop words
 * - v3.0: Added Row Adapter helpers for database operations
 */

// ============================================================
// SECTION 1: HASHING & ID GENERATION
// ============================================================

/**
 * Generates an MD5 hash from the input key.
 * Used for creating unique identifiers based on string content.
 * 
 * @param {string} key - The input string to hash
 * @returns {string} The MD5 hash in hexadecimal format, or "empty_hash" if input is falsy
 * 
 * @example
 * var hash = md5("customer_123");
 * // Returns: "8f3a6e9c..."
 */
function md5(key) {
  if (!key) return "empty_hash";
  
  var code = key.toString().toLowerCase().replace(/\s/g, "");
  
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, code)
    .map(function(char) {
      return (char + 256).toString(16).slice(-2);
    })
    .join("");
}

/**
 * Generates a universally unique identifier (UUID).
 * Uses Google Apps Script's built-in UUID generator.
 * 
 * @returns {string} A new UUID string
 * 
 * @example
 * var uuid = generateUUID();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
function generateUUID() {
  return Utilities.getUuid();
}

// ============================================================
// SECTION 2: TEXT PROCESSING & NORMALIZATION
// ============================================================

/**
 * Normalizes text by removing common logistics-related stop words and special characters.
 * Enhanced with logistics-specific terms (warehouse, building, floor, etc.).
 * Used for fuzzy matching and entity resolution.
 * 
 * @param {string} text - The input text to normalize
 * @returns {string} Normalized text with stop words and special characters removed
 * 
 * @example
 * var normalized = normalizeText("บริษัท ตัวอย่าง จำกัด สาขากรุงเทพ");
 * // Returns: "ตัวอย่างกรุงเทพ"
 */
function normalizeText(text) {
  if (!text) return "";
  
  var clean = text.toString().toLowerCase();
  
  // Remove logistics-specific stop words (Thai and English)
  var stopWordsPattern = /บริษัท|บจก\.?|บมจ\.?|หจก\.?|ห้างหุ้นส่วน|จำกัด|มหาชน|ส่วนบุคคล|ร้าน|ห้าง|สาขา|สำนักงานใหญ่|store|shop|company|co\.?|ltd\.?|inc\.?|จังหวัด|อำเภอ|ตำบล|เขต|แขวง|ถนน|ซอย|นาย|นาง|นางสาว|โกดัง|คลังสินค้า|หมู่ที่|หมู่|อาคาร|ชั้น/g;
  clean = clean.replace(stopWordsPattern, "");

  // Remove all non-alphanumeric characters (keeping Thai script)
  return clean.replace(/[^a-z0-9\u0E00-\u0E7F]/g, "");
}

/**
 * Cleans and formats distance values to a standardized numeric format.
 * Extracts numeric value and formats to 2 decimal places.
 * 
 * @param {*} val - The distance value to clean (can be string or number)
 * @returns {string} Formatted distance with 2 decimal places, or empty string if invalid
 * 
 * @example
 * var distance = cleanDistance("12.5 km");
 * // Returns: "12.50"
 */
function cleanDistance(val) {
  if (!val && val !== 0) return "";
  
  var str = val.toString().replace(/[^0-9.]/g, ""); 
  var num = parseFloat(str);
  
  return isNaN(num) ? "" : num.toFixed(2);
}

// ============================================================
// SECTION 3: SMART NAMING LOGIC
// ============================================================

/**
 * Selects the best name from a list of candidate names using a scoring algorithm.
 * Evaluates names based on frequency, formal structure, completeness, and length.
 * 
 * Scoring criteria:
 * - Frequency: +10 points per occurrence
 * - Formal prefixes (Company types): +5 points
 * - Branch indicators: +5 points
 * - Balanced parentheses: +5 points
 * - Unbalanced parentheses: -30 points
 * - Phone numbers in name: -30 points
 * - Contact keywords: -10 points
 * - Optimal length (5-70 chars): bonus points
 * 
 * @param {string[]} names - Array of candidate names to evaluate
 * @returns {string} The best-scoring name after cleaning, or empty string if no valid names
 * 
 * @example
 * var bestName = getBestName_Smart(["บริษัท A", "A สาขา", "A (ติดต่อ 081-234-5678)"]);
 * // Returns: "บริษัท A"
 */
function getBestName_Smart(names) {
  if (!names || names.length === 0) return "";
  
  var nameScores = {};
  var bestName = names[0];
  var maxScore = -9999;
  
  // Count occurrences of each name
  names.forEach(function(n) {
    if (!n) return;
    
    var original = n.toString().trim();
    if (original === "") return;

    if (!nameScores[original]) {
      nameScores[original] = { count: 0, score: 0 };
    }
    nameScores[original].count += 1;
  });

  // Calculate scores for each unique name
  for (var n in nameScores) {
    var s = nameScores[n].count * 10; 
    
    // Bonus for formal company structure
    if (/(บริษัท|บจก|หจก|บมจ)/.test(n)) s += 5; 
    if (/(จำกัด|มหาชน)/.test(n)) s += 5;        
    if (/(สาขา)/.test(n)) s += 5;               
    
    // Check parenthesis balance
    var openBrackets = (n.match(/\(/g) || []).length;
    var closeBrackets = (n.match(/\)/g) || []).length;
    
    if (openBrackets > 0 && openBrackets === closeBrackets) {
      s += 5; 
    } else if (openBrackets !== closeBrackets) {
      s -= 30; 
    }
    
    // Penalty for phone numbers or contact info in name
    if (/[0-9]{9,10}/.test(n) || /โทร/.test(n)) s -= 30; 
    if (/ส่ง|รับ|ติดต่อ/.test(n)) s -= 10;                
    
    // Length-based scoring
    var len = n.length;
    if (len > 70) {
      s -= (len - 70); 
    } else if (len < 5) {
      s -= 10;         
    } else {
      s += (len * 0.1);
    }

    nameScores[n].score = s;
    
    if (s > maxScore) {
      maxScore = s;
      bestName = n;
    }
  }
  
  return cleanDisplayName(bestName);
}

/**
 * Cleans display names by removing phone numbers and extra whitespace.
 * 
 * @param {string} name - The name to clean
 * @returns {string} Cleaned name with phone numbers and extra spaces removed
 * 
 * @example
 * var clean = cleanDisplayName("ร้านค้า A โทร. 081-234-5678");
 * // Returns: "ร้านค้า A"
 */
function cleanDisplayName(name) {
  var clean = name.toString();
  
  // Remove phone number patterns
  clean = clean.replace(/\s*โทร\.?\s*[0-9-]{9,12}/g, '');
  clean = clean.replace(/\s*0[0-9]{1,2}-[0-9]{3}-[0-9]{4}/g, '');
  
  // Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  return clean;
}

// ============================================================
// SECTION 4: GEO MATH & FUZZY MATCHING
// ============================================================

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 * 
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lon1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lon2 - Longitude of second point in degrees
 * @returns {number|null} Distance in kilometers (rounded to 3 decimals), or null if invalid input
 * 
 * @example
 * var distance = getHaversineDistanceKM(13.7563, 100.5018, 14.0583, 100.6767);
 * // Returns: 35.421 (km)
 */
function getHaversineDistanceKM(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  var R = 6371; // Earth's radius in kilometers
  
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return parseFloat((R * c).toFixed(3)); 
}

// ============================================================
// SECTION 5: SYSTEM UTILITIES (LOGGING, RETRY & ARRAY OPS)
// ============================================================

/**
 * Executes a function with automatic retry logic using exponential backoff.
 * Enhanced with enterprise-grade console logging for debugging and monitoring.
 * 
 * @param {Function} func - The function to execute
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {*} The return value of the successful function execution
 * @throws {Error} Re-throws the error after all retry attempts are exhausted
 * 
 * @example
 * var result = genericRetry(function() {
 *   return riskyApiCall();
 * }, 3);
 */
function genericRetry(func, maxRetries) {
  for (var i = 0; i < maxRetries; i++) {
    try {
      return func();
    } catch (e) {
      if (i === maxRetries - 1) {
        console.error("[GenericRetry] FATAL ERROR after " + maxRetries + " attempts: " + e.message);
        throw e;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      Utilities.sleep(1000 * Math.pow(2, i)); 
      
      console.warn("[GenericRetry] Attempt " + (i + 1) + " failed: " + e.message + ". Retrying...");
    }
  }
}

/**
 * Safely parses a JSON string, returning null if parsing fails.
 * Prevents application crashes from malformed JSON.
 * 
 * @param {string} str - The JSON string to parse
 * @returns {object|array|null} Parsed JSON object/array, or null if parsing fails
 * 
 * @example
 * var data = safeJsonParse('{"key": "value"}');
 * // Returns: {key: "value"}
 */
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

// ============================================================
// SECTION 6: ROW ADAPTER HELPERS
// Converts raw spreadsheet row arrays to objects and vice versa
// Eliminates magic numbers by using CONFIG index constants
// ============================================================

/**
 * Converts a database row array to a structured object.
 * Maps spreadsheet columns to named properties using CONFIG.C_IDX constants.
 * 
 * @param {Array} row - Raw row array from spreadsheet
 * @returns {object|null} Object with named properties, or null if row is falsy
 * 
 * @property {string} name - Entity name
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {string} suggested - Suggested address
 * @property {number} confidence - Confidence score
 * @property {string} normalized - Normalized name
 * @property {boolean} verified - Verification status
 * @property {string} sysAddr - System address
 * @property {string} googleAddr - Google address
 * @property {number} distKm - Distance in kilometers
 * @property {string} uuid - Unique identifier
 * @property {string} province - Province name
 * @property {string} district - District name
 * @property {string} postcode - Postal code
 * @property {number} quality - Quality score
 * @property {Date} created - Creation timestamp
 * @property {Date} updated - Last update timestamp
 * @property {string} coordSource - Coordinate source
 * @property {number} coordConfidence - Coordinate confidence
 * @property {Date} coordLastUpdated - Coordinate last update
 * @property {string} recordStatus - Record status (Active/Deleted)
 * @property {string} mergedToUuid - Merged target UUID
 */
function dbRowToObject(row) {
  if (!row) return null;
  
  return {
    name:             row[CONFIG.C_IDX.NAME],
    lat:              row[CONFIG.C_IDX.LAT],
    lng:              row[CONFIG.C_IDX.LNG],
    suggested:        row[CONFIG.C_IDX.SUGGESTED],
    confidence:       row[CONFIG.C_IDX.CONFIDENCE],
    normalized:       row[CONFIG.C_IDX.NORMALIZED],
    verified:         row[CONFIG.C_IDX.VERIFIED],
    sysAddr:          row[CONFIG.C_IDX.SYS_ADDR],
    googleAddr:       row[CONFIG.C_IDX.GOOGLE_ADDR],
    distKm:           row[CONFIG.C_IDX.DIST_KM],
    uuid:             row[CONFIG.C_IDX.UUID],
    province:         row[CONFIG.C_IDX.PROVINCE],
    district:         row[CONFIG.C_IDX.DISTRICT],
    postcode:         row[CONFIG.C_IDX.POSTCODE],
    quality:          row[CONFIG.C_IDX.QUALITY],
    created:          row[CONFIG.C_IDX.CREATED],
    updated:          row[CONFIG.C_IDX.UPDATED],
    coordSource:      row[CONFIG.C_IDX.COORD_SOURCE],
    coordConfidence:  row[CONFIG.C_IDX.COORD_CONFIDENCE],
    coordLastUpdated: row[CONFIG.C_IDX.COORD_LAST_UPDATED],
    recordStatus:     row[CONFIG.C_IDX.RECORD_STATUS],
    mergedToUuid:     row[CONFIG.C_IDX.MERGED_TO_UUID]
  };
}

/**
 * Converts a database object to a row array for spreadsheet writing.
 * Maps named properties to spreadsheet columns using CONFIG constants.
 * 
 * @param {object} obj - Object with database properties
 * @returns {Array} Row array formatted for spreadsheet writing
 */
function dbObjectToRow(obj) {
  var row = new Array(CONFIG.DB_TOTAL_COLS).fill("");
  
  row[CONFIG.C_IDX.NAME]               = obj.name             || "";
  row[CONFIG.C_IDX.LAT]                = obj.lat              || "";
  row[CONFIG.C_IDX.LNG]                = obj.lng              || "";
  row[CONFIG.C_IDX.SUGGESTED]          = obj.suggested        || "";
  row[CONFIG.C_IDX.CONFIDENCE]         = obj.confidence       || "";
  row[CONFIG.C_IDX.NORMALIZED]         = obj.normalized       || "";
  row[CONFIG.C_IDX.VERIFIED]           = obj.verified         || false;
  row[CONFIG.C_IDX.SYS_ADDR]           = obj.sysAddr          || "";
  row[CONFIG.C_IDX.GOOGLE_ADDR]        = obj.googleAddr       || "";
  row[CONFIG.C_IDX.DIST_KM]            = obj.distKm           || "";
  row[CONFIG.C_IDX.UUID]               = obj.uuid             || "";
  row[CONFIG.C_IDX.PROVINCE]           = obj.province         || "";
  row[CONFIG.C_IDX.DISTRICT]           = obj.district         || "";
  row[CONFIG.C_IDX.POSTCODE]           = obj.postcode         || "";
  row[CONFIG.C_IDX.QUALITY]            = obj.quality          || 0;
  row[CONFIG.C_IDX.CREATED]            = obj.created          || "";
  row[CONFIG.C_IDX.UPDATED]            = obj.updated          || "";
  row[CONFIG.C_IDX.COORD_SOURCE]       = obj.coordSource      || "";
  row[CONFIG.C_IDX.COORD_CONFIDENCE]   = obj.coordConfidence  || 0;
  row[CONFIG.C_IDX.COORD_LAST_UPDATED] = obj.coordLastUpdated || "";
  row[CONFIG.C_IDX.RECORD_STATUS]      = obj.recordStatus     || "Active";
  row[CONFIG.C_IDX.MERGED_TO_UUID]     = obj.mergedToUuid     || "";
  
  return row;
}

/**
 * Converts a NameMapping sheet row array to a structured object.
 * 
 * @param {Array} row - Raw row array from NameMapping sheet
 * @returns {object|null} Object with mapping properties, or null if row is falsy
 * 
 * @property {string} variant - Name variant
 * @property {string} uid - Associated UUID
 * @property {number} confidence - Mapping confidence score
 * @property {string} mappedBy - User/system that created mapping
 * @property {Date} timestamp - Mapping creation timestamp
 */
function mapRowToObject(row) {
  if (!row) return null;
  
  return {
    variant:    row[CONFIG.MAP_IDX.VARIANT],
    uid:        row[CONFIG.MAP_IDX.UID],
    confidence: row[CONFIG.MAP_IDX.CONFIDENCE],
    mappedBy:   row[CONFIG.MAP_IDX.MAPPED_BY],
    timestamp:  row[CONFIG.MAP_IDX.TIMESTAMP]
  };
}

/**
 * Converts a NameMapping object to a row array for spreadsheet writing.
 * 
 * @param {object} obj - Object with mapping properties
 * @returns {Array} Row array formatted for NameMapping sheet
 */
function mapObjectToRow(obj) {
  var row = new Array(CONFIG.MAP_TOTAL_COLS).fill("");
  
  row[CONFIG.MAP_IDX.VARIANT]    = obj.variant    || "";
  row[CONFIG.MAP_IDX.UID]        = obj.uid        || "";
  row[CONFIG.MAP_IDX.CONFIDENCE] = obj.confidence || 100;
  row[CONFIG.MAP_IDX.MAPPED_BY]  = obj.mappedBy   || "";
  row[CONFIG.MAP_IDX.TIMESTAMP]  = obj.timestamp  || new Date();
  
  return row;
}

/**
 * Converts a GPS_Queue sheet row array to a structured object.
 * 
 * @param {Array} row - Raw row array from GPS_Queue sheet
 * @returns {object|null} Object with queue entry properties, or null if row is falsy
 * 
 * @property {Date} timestamp - Entry timestamp
 * @property {string} shipToName - Ship-to location name
 * @property {string} uuidDb - Database UUID
 * @property {string} latLngDriver - Driver-reported coordinates
 * @property {string} latLngDb - Database coordinates
 * @property {number} diffMeters - Distance difference in meters
 * @property {string} reason - Reason for queue entry
 * @property {boolean} approve - Approval status
 * @property {boolean} reject - Rejection status
 */
function queueRowToObject(row) {
  if (!row) return null;
  
  return {
    timestamp:    row[0],
    shipToName:   row[1],
    uuidDb:       row[2],
    latLngDriver: row[3],
    latLngDb:     row[4],
    diffMeters:   row[5],
    reason:       row[6],
    approve:      row[7],
    reject:       row[8]
  };
}

/**
 * Converts a GPS queue object to a row array for spreadsheet writing.
 * 
 * @param {object} obj - Object with queue entry properties
 * @returns {Array} Row array formatted for GPS_Queue sheet
 */
function queueObjectToRow(obj) {
  return [
    obj.timestamp    || "",
    obj.shipToName   || "",
    obj.uuidDb       || "",
    obj.latLngDriver || "",
    obj.latLngDb     || "",
    obj.diffMeters   || "",
    obj.reason       || "",
    obj.approve      || false,
    obj.reject       || false
  ];
}

/**
 * Converts a Daily Job sheet row array to a structured object.
 * Maps spreadsheet columns to named properties using DATA_IDX constants.
 * 
 * @param {Array} row - Raw row array from Data sheet
 * @returns {object|null} Object with job properties, or null if row is falsy
 * 
 * @property {string} jobId - Job identifier
 * @property {Date} planDelivery - Planned delivery date
 * @property {string} invoiceNo - Invoice number
 * @property {string} shipmentNo - Shipment number
 * @property {string} driverName - Driver name
 * @property {string} truckLicense - Truck license plate
 * @property {string} carrierCode - Carrier code
 * @property {string} carrierName - Carrier name
 * @property {string} soldToCode - Sold-to customer code
 * @property {string} soldToName - Sold-to customer name
 * @property {string} shipToName - Ship-to location name
 * @property {string} shipToAddr - Ship-to address
 * @property {string} latLngScg - SCG coordinates
 * @property {string} material - Material code
 * @property {number} qty - Quantity
 * @property {string} qtyUnit - Quantity unit
 * @property {number} weight - Weight
 * @property {string} deliveryNo - Delivery number
 * @property {number} destCount - Destination count
 * @property {string} destList - Destination list
 * @property {string} scanStatus - Scan status
 * @property {string} deliveryStatus - Delivery status
 * @property {string} email - Contact email
 * @property {number} totQty - Total quantity
 * @property {number} totWeight - Total weight
 * @property {string} scanInv - Scan invoice
 * @property {string} latLngActual - Actual coordinates
 * @property {string} ownerLabel - Owner label
 * @property {string} shopKey - Shop key
 */
function dailyJobRowToObject(row) {
  if (!row) return null;
  
  return {
    jobId:          row[DATA_IDX.JOB_ID],
    planDelivery:   row[DATA_IDX.PLAN_DELIVERY],
    invoiceNo:      row[DATA_IDX.INVOICE_NO],
    shipmentNo:     row[DATA_IDX.SHIPMENT_NO],
    driverName:     row[DATA_IDX.DRIVER_NAME],
    truckLicense:   row[DATA_IDX.TRUCK_LICENSE],
    carrierCode:    row[DATA_IDX.CARRIER_CODE],
    carrierName:    row[DATA_IDX.CARRIER_NAME],
    soldToCode:     row[DATA_IDX.SOLD_TO_CODE],
    soldToName:     row[DATA_IDX.SOLD_TO_NAME],
    shipToName:     row[DATA_IDX.SHIP_TO_NAME],
    shipToAddr:     row[DATA_IDX.SHIP_TO_ADDR],
    latLngScg:      row[DATA_IDX.LATLNG_SCG],
    material:       row[DATA_IDX.MATERIAL],
    qty:            row[DATA_IDX.QTY],
    qtyUnit:        row[DATA_IDX.QTY_UNIT],
    weight:         row[DATA_IDX.WEIGHT],
    deliveryNo:     row[DATA_IDX.DELIVERY_NO],
    destCount:      row[DATA_IDX.DEST_COUNT],
    destList:       row[DATA_IDX.DEST_LIST],
    scanStatus:     row[DATA_IDX.SCAN_STATUS],
    deliveryStatus: row[DATA_IDX.DELIVERY_STATUS],
    email:          row[DATA_IDX.EMAIL],
    totQty:         row[DATA_IDX.TOT_QTY],
    totWeight:      row[DATA_IDX.TOT_WEIGHT],
    scanInv:        row[DATA_IDX.SCAN_INV],
    latLngActual:   row[DATA_IDX.LATLNG_ACTUAL],
    ownerLabel:     row[DATA_IDX.OWNER_LABEL],
    shopKey:        row[DATA_IDX.SHOP_KEY]
  };
}
