/**
 * @fileoverview Config.gs - Central Configuration Module for LMDS
 * 
 * Logistics Master Data System (LMDS) Configuration
 * Version: 5.0.0 - Enterprise Edition
 * 
 * This module contains all system-wide configuration constants,
 * column mappings, and validation utilities for the LMDS application.
 * 
 * @author LMDS Development Team
 * @version 5.0.0
 * @since 2024-01-15
 */

// ============================================================================
// SECTION 1: CORE CONFIGURATION OBJECT
// ============================================================================

/**
 * Main configuration object containing all system settings
 * @namespace CONFIG
 * @property {string} SHEET_NAME - Primary database sheet name
 * @property {string} MAPPING_SHEET - Name mapping sheet name
 * @property {string} SOURCE_SHEET - SCG source data sheet name
 * @property {string} SHEET_POSTAL - Postal reference sheet name
 * @property {number} DB_TOTAL_COLS - Total columns in Database sheet
 * @property {number} DB_LEGACY_COLS - Legacy column count for migration
 * @property {number} MAP_TOTAL_COLS - Total columns in NameMapping sheet
 * @property {number} GPS_QUEUE_TOTAL_COLS - Total columns in GPS_Queue sheet
 * @property {number} DATA_TOTAL_COLS - Total columns in Data sheet
 * @property {Object} DB_REQUIRED_HEADERS - Required headers for Database sheet
 * @property {Object} MAP_REQUIRED_HEADERS - Required headers for NameMapping sheet
 * @property {Object} GPS_QUEUE_REQUIRED_HEADERS - Required headers for GPS_Queue sheet
 */
var CONFIG = {
  // --------------------------------------------------------------------------
  // 1.1 Sheet Names
  // --------------------------------------------------------------------------
  SHEET_NAME: "Database",
  MAPPING_SHEET: "NameMapping",
  SOURCE_SHEET: "SCGนครหลวงJWDภูมิภาค",
  SHEET_POSTAL: "PostalRef",

  // --------------------------------------------------------------------------
  // 1.2 Schema Width Constants
  // --------------------------------------------------------------------------
  DB_TOTAL_COLS: 22,
  DB_LEGACY_COLS: 17,
  MAP_TOTAL_COLS: 5,
  GPS_QUEUE_TOTAL_COLS: 9,
  DATA_TOTAL_COLS: 29,

  // --------------------------------------------------------------------------
  // 1.3 Required Header Definitions (1-based column index)
  // --------------------------------------------------------------------------
  /**
   * Database sheet required headers with column positions
   * @type {Object<number, string>}
   */
  DB_REQUIRED_HEADERS: {
    1: "NAME",
    2: "LAT",
    3: "LNG",
    11: "UUID",
    15: "QUALITY",
    16: "CREATED",
    17: "UPDATED",
    18: "Coord_Source",
    19: "Coord_Confidence",
    20: "Coord_Last_Updated",
    21: "Record_Status",
    22: "Merged_To_UUID"
  },

  /**
   * NameMapping sheet required headers with column positions
   * @type {Object<number, string>}
   */
  MAP_REQUIRED_HEADERS: {
    1: "Variant_Name",
    2: "Master_UID",
    3: "Confidence_Score",
    4: "Mapped_By",
    5: "Timestamp"
  },

  /**
   * GPS_Queue sheet required headers with column positions
   * @type {Object<number, string>}
   */
  GPS_QUEUE_REQUIRED_HEADERS: {
    1: "Timestamp",
    2: "ShipToName",
    3: "UUID_DB",
    4: "LatLng_Driver",
    5: "LatLng_DB",
    6: "Diff_Meters",
    7: "Reason",
    8: "Approve",
    9: "Reject"
  },

  // --------------------------------------------------------------------------
  // 1.4 AI/ML Configuration
  // --------------------------------------------------------------------------
  /**
   * Gemini API Key from Script Properties
   * @type {string}
   * @throws {Error} If GEMINI_API_KEY is not set or invalid
   */
  get GEMINI_API_KEY() {
    var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!key) {
      throw new Error(
        "CRITICAL ERROR: GEMINI_API_KEY is not set. Please run setupEnvironment() first."
      );
    }
    return key;
  },

  USE_AI_AUTO_FIX: true,
  AI_MODEL: "gemini-1.5-flash",
  AI_BATCH_SIZE: 20,

  // --------------------------------------------------------------------------
  // 1.5 Geographic & Distance Settings
  // --------------------------------------------------------------------------
  DEPOT_LAT: 14.164688,
  DEPOT_LNG: 100.625354,
  DISTANCE_THRESHOLD_KM: 0.05,

  // --------------------------------------------------------------------------
  // 1.6 Performance & Batch Processing Limits
  // --------------------------------------------------------------------------
  BATCH_LIMIT: 50,
  DEEP_CLEAN_LIMIT: 100,
  API_MAX_RETRIES: 3,
  API_TIMEOUT_MS: 30000,
  CACHE_EXPIRATION: 21600,

  // --------------------------------------------------------------------------
  // 1.7 Database Column Index Constants (1-based)
  // --------------------------------------------------------------------------
  COL_NAME: 1,
  COL_LAT: 2,
  COL_LNG: 3,
  COL_SUGGESTED: 4,
  COL_CONFIDENCE: 5,
  COL_NORMALIZED: 6,
  COL_VERIFIED: 7,
  COL_SYS_ADDR: 8,
  COL_ADDR_GOOG: 9,
  COL_DIST_KM: 10,
  COL_UUID: 11,
  COL_PROVINCE: 12,
  COL_DISTRICT: 13,
  COL_POSTCODE: 14,
  COL_QUALITY: 15,
  COL_CREATED: 16,
  COL_UPDATED: 17,
  COL_COORD_SOURCE: 18,
  COL_COORD_CONFIDENCE: 19,
  COL_COORD_LAST_UPDATED: 20,
  COL_RECORD_STATUS: 21,
  COL_MERGED_TO_UUID: 22,

  // --------------------------------------------------------------------------
  // 1.8 NameMapping Column Index Constants (1-based)
  // --------------------------------------------------------------------------
  MAP_COL_VARIANT: 1,
  MAP_COL_UID: 2,
  MAP_COL_CONFIDENCE: 3,
  MAP_COL_MAPPED_BY: 4,
  MAP_COL_TIMESTAMP: 5,

  // --------------------------------------------------------------------------
  // 1.9 Zero-Based Index Getters for Array Access
  // --------------------------------------------------------------------------
  /**
   * Returns zero-based column indices for Database sheet array access
   * @returns {Object} Object with zero-based indices for all database columns
   * @example
   * var idx = CONFIG.C_IDX;
   * var nameValue = row[idx.NAME];
   */
  get C_IDX() {
    return {
      NAME: this.COL_NAME - 1,
      LAT: this.COL_LAT - 1,
      LNG: this.COL_LNG - 1,
      SUGGESTED: this.COL_SUGGESTED - 1,
      CONFIDENCE: this.COL_CONFIDENCE - 1,
      NORMALIZED: this.COL_NORMALIZED - 1,
      VERIFIED: this.COL_VERIFIED - 1,
      SYS_ADDR: this.COL_SYS_ADDR - 1,
      GOOGLE_ADDR: this.COL_ADDR_GOOG - 1,
      DIST_KM: this.COL_DIST_KM - 1,
      UUID: this.COL_UUID - 1,
      PROVINCE: this.COL_PROVINCE - 1,
      DISTRICT: this.COL_DISTRICT - 1,
      POSTCODE: this.COL_POSTCODE - 1,
      QUALITY: this.COL_QUALITY - 1,
      CREATED: this.COL_CREATED - 1,
      UPDATED: this.COL_UPDATED - 1,
      COORD_SOURCE: this.COL_COORD_SOURCE - 1,
      COORD_CONFIDENCE: this.COL_COORD_CONFIDENCE - 1,
      COORD_LAST_UPDATED: this.COL_COORD_LAST_UPDATED - 1,
      RECORD_STATUS: this.COL_RECORD_STATUS - 1,
      MERGED_TO_UUID: this.COL_MERGED_TO_UUID - 1
    };
  },

  /**
   * Returns zero-based column indices for NameMapping sheet array access
   * @returns {Object} Object with zero-based indices for all mapping columns
   * @example
   * var mapIdx = CONFIG.MAP_IDX;
   * var variantName = row[mapIdx.VARIANT];
   */
  get MAP_IDX() {
    return {
      VARIANT: this.MAP_COL_VARIANT - 1,
      UID: this.MAP_COL_UID - 1,
      CONFIDENCE: this.MAP_COL_CONFIDENCE - 1,
      MAPPED_BY: this.MAP_COL_MAPPED_BY - 1,
      TIMESTAMP: this.MAP_COL_TIMESTAMP - 1
    };
  }
};

// ============================================================================
// SECTION 2: SCG INTEGRATION CONFIGURATION
// ============================================================================

/**
 * SCG FSM Integration configuration
 * Contains settings for SCG delivery data synchronization
 * @namespace SCG_CONFIG
 * @property {string} SHEET_DATA - Data sheet name for SCG records
 * @property {string} SHEET_INPUT - Input sheet name for manual entries
 * @property {string} SHEET_EMPLOYEE - Employee information sheet name
 * @property {string} API_URL - SCG FSM API endpoint
 * @property {number} INPUT_START_ROW - Starting row for input processing
 * @property {string} COOKIE_CELL - Cell reference for authentication cookie
 * @property {string} SHIPMENT_STRING_CELL - Cell reference for shipment data
 * @property {string} SHEET_MASTER_DB - Master database sheet name
 * @property {string} SHEET_MAPPING - Name mapping sheet name
 * @property {string} SHEET_GPS_QUEUE - GPS feedback queue sheet name
 * @property {number} GPS_THRESHOLD_METERS - GPS coordinate match threshold
 * @property {Object} SRC_IDX - Source data column indices
 * @property {number} SRC_IDX_SYNC_STATUS - Sync status column index
 * @property {string} SYNC_STATUS_DONE - Completed sync status value
 * @property {Object} JSON_MAP - JSON field mappings for API responses
 */
const SCG_CONFIG = {
  SHEET_DATA: 'Data',
  SHEET_INPUT: 'Input',
  SHEET_EMPLOYEE: 'ข้อมูลพนักงาน',
  API_URL: 'https://fsm.scgjwd.com/Monitor/SearchDelivery',
  INPUT_START_ROW: 4,
  COOKIE_CELL: 'B1',
  SHIPMENT_STRING_CELL: 'B3',
  SHEET_MASTER_DB: 'Database',
  SHEET_MAPPING: 'NameMapping',
  SHEET_GPS_QUEUE: 'GPS_Queue',
  GPS_THRESHOLD_METERS: 50,
  SRC_IDX: {
    NAME: 12,
    LAT: 14,
    LNG: 15,
    SYS_ADDR: 18,
    DIST: 23,
    GOOG_ADDR: 24
  },
  SRC_IDX_SYNC_STATUS: 37,
  SYNC_STATUS_DONE: "SYNCED",
  JSON_MAP: {
    SHIPMENT_NO: 'shipmentNo',
    CUSTOMER_NAME: 'customerName',
    DELIVERY_DATE: 'deliveryDate'
  }
};

// ============================================================================
// SECTION 3: DATA SHEET COLUMN INDICES
// ============================================================================

/**
 * Data sheet column indices for Service_SCG.gs (0-based)
 * Replaces scattered references like r[10], r[22], r[26]
 * @namespace DATA_IDX
 * @readonly
 * @enum {number}
 */
const DATA_IDX = {
  JOB_ID: 0,
  PLAN_DELIVERY: 1,
  INVOICE_NO: 2,
  SHIPMENT_NO: 3,
  DRIVER_NAME: 4,
  TRUCK_LICENSE: 5,
  CARRIER_CODE: 6,
  CARRIER_NAME: 7,
  SOLD_TO_CODE: 8,
  SOLD_TO_NAME: 9,
  SHIP_TO_NAME: 10,
  SHIP_TO_ADDR: 11,
  LATLNG_SCG: 12,
  MATERIAL: 13,
  QTY: 14,
  QTY_UNIT: 15,
  WEIGHT: 16,
  DELIVERY_NO: 17,
  DEST_COUNT: 18,
  DEST_LIST: 19,
  SCAN_STATUS: 20,
  DELIVERY_STATUS: 21,
  EMAIL: 22,
  TOT_QTY: 23,
  TOT_WEIGHT: 24,
  SCAN_INV: 25,
  LATLNG_ACTUAL: 26,
  OWNER_LABEL: 27,
  SHOP_KEY: 28
};

// ============================================================================
// SECTION 4: AI CONFIGURATION
// ============================================================================

/**
 * AI/ML Configuration for intelligent matching and auto-fix operations
 * @namespace AI_CONFIG
 * @property {number} THRESHOLD_AUTO_MAP - Confidence threshold for auto-mapping (>=90%)
 * @property {number} THRESHOLD_REVIEW - Confidence threshold for review queue (70-89%)
 * @property {number} THRESHOLD_IGNORE - Confidence threshold for ignoring (<70%)
 * @property {string} TAG_AI - Tag prefix for AI-generated content
 * @property {string} TAG_REVIEWED - Tag for human-reviewed content
 * @property {string} PROMPT_VERSION - Current AI prompt version
 * @property {number} RETRIEVAL_LIMIT - Candidate retrieval limit before AI processing
 */
const AI_CONFIG = {
  THRESHOLD_AUTO_MAP: 90,
  THRESHOLD_REVIEW: 70,
  THRESHOLD_IGNORE: 70,
  TAG_AI: "[AI]",
  TAG_REVIEWED: "[REVIEWED]",
  PROMPT_VERSION: "v4.2",
  RETRIEVAL_LIMIT: 50
};

// ============================================================================
// SECTION 5: SYSTEM VALIDATION UTILITIES
// ============================================================================

/**
 * Validates system integrity by checking required sheets and API configuration
 * 
 * Performs the following checks:
 * - Verifies existence of required sheets (Database, NameMapping, Input, PostalRef)
 * - Validates GEMINI_API_KEY is set and has minimum length
 * - Throws detailed error if any check fails
 * 
 * @memberof CONFIG
 * @function validateSystemIntegrity
 * @returns {boolean} True if all checks pass
 * @throws {Error} If any system integrity check fails
 * 
 * @example
 * try {
 *   CONFIG.validateSystemIntegrity();
 *   console.log("System is healthy");
 * } catch (e) {
 *   console.error("System check failed: " + e.message);
 * }
 */
CONFIG.validateSystemIntegrity = function() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var errors = [];

  var requiredSheets = [
    this.SHEET_NAME,
    this.MAPPING_SHEET,
    SCG_CONFIG.SHEET_INPUT,
    this.SHEET_POSTAL
  ];

  requiredSheets.forEach(function(sheetName) {
    if (!ss.getSheetByName(sheetName)) {
      errors.push("Missing Sheet: " + sheetName);
    }
  });

  try {
    var apiKey = this.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 20) {
      errors.push("Invalid Gemini API Key format");
    }
  } catch (e) {
    errors.push("Gemini API Key not set. Run setupEnvironment() first.");
  }

  if (errors.length > 0) {
    var errorMsg = "⚠️ SYSTEM INTEGRITY FAILED:\n" + errors.join("\n");
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log("✅ System Integrity: OK");
  return true;
};
