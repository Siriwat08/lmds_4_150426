/**
 * @fileoverview Menu UI Interface - Google Sheets Menu System
 * @version 5.0 Enterprise Edition
 * @description Provides comprehensive menu system for Logistics Master Data System
 *              with organized submenus for Master Data, SCG Integration, 
 *              Automation, and System Administration.
 * @author Elite Logistics Architect
 * @since 2024
 * 
 * VERSION HISTORY:
 * - v5.0: Enterprise refactor with JSDoc standards
 * - v4.2: Added Phase D test helpers and Dry Run options
 * - v4.1: Fixed dynamic UI alerts using CONFIG sheet names
 */

// =============================================================================
// SECTION 1: MAIN MENU INITIALIZATION
// =============================================================================

/**
 * Creates custom menu in Google Sheets when spreadsheet opens
 * @name onOpen
 * @function
 * @returns {void}
 * 
 * @description
 * Builds 4 main menus:
 * 1. Master Data - Customer data management tools
 * 2. SCG Integration - SCG integration and GPS queue management
 * 3. Automation - Auto-pilot and AI agent controls
 * 4. System Admin - Health checks, diagnostics, and configuration
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  // MENU 1: MASTER DATA MANAGEMENT
  ui.createMenu('1. Master Data')
    .addItem('1. Sync New Data',        'syncNewDataToMaster_UI')
    .addItem('2. Update Geo Data (50)',   'updateGeoData_SmartCache')
    .addItem('3. Clustering',         'autoGenerateMasterList_Smart')
    .addItem('4. AI Analysis',       'runAIBatchResolver_UI')
    .addSeparator()
    .addItem('5. Deep Clean',    'runDeepCleanBatch_100')
    .addItem('6. Reset Deep Clean Memory',                    'resetDeepCleanMemory_UI')
    .addSeparator()
    .addItem('7. Finalize & Move to Mapping', 'finalizeAndClean_UI')
    .addSeparator()
    .addSubMenu(ui.createMenu('Admin Tools')
      .addItem('Assign Missing UUIDs',              'assignMissingUUIDs')
      .addItem('Repair NameMapping',                   'repairNameMapping_UI')
      .addSeparator()
      .addItem('Find Hidden Duplicates',                    'findHiddenDuplicates')
      .addItem('Show Quality Report',                   'showQualityReport_UI')
      .addItem('Recalculate All Quality',             'recalculateAllQuality')
      .addItem('Recalculate All Confidence',          'recalculateAllConfidence')
      .addSeparator()
      .addItem('Initialize Record Status',              'initializeRecordStatus')
      .addItem('Merge Duplicates',                    'mergeDuplicates_UI')
      .addItem('Show Record Status Report',                'showRecordStatusReport')
    )
    .addToUi();

  // MENU 2: SCG INTEGRATION
  ui.createMenu('2. SCG Integration')
    .addItem('1. Fetch Shipment Data',        'fetchDataFromSCGJWD')
    .addItem('2. Apply Master Coordinates',          'applyMasterCoordinatesToDailyJob')
    .addSeparator()
    .addSubMenu(ui.createMenu('GPS Queue')
      .addItem('1. Sync GPS to Queue',          'syncNewDataToMaster_UI')
      .addItem('2. Approve Selected',            'applyApprovedFeedback')
      .addItem('3. Show Queue Stats',                       'showGPSQueueStats')
      .addSeparator()
      .addItem('Create GPS Queue Sheet',               'createGPSQueueSheet')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu('Dangerous Zone')
      .addItem('Clear Data Sheet',                     'clearDataSheet_UI')
      .addItem('Clear Input Sheet',                    'clearInputSheet_UI')
      .addItem('Clear Summary Sheet',       'clearSummarySheet_UI')
      .addItem('Clear All SCG Sheets',                            'clearAllSCGSheets_UI')
    )
    .addToUi();

  // MENU 3: AUTOMATION
  ui.createMenu('3. Automation')
    .addItem('Start Auto-Pilot',                     'START_AUTO_PILOT')
    .addItem('Stop Auto-Pilot',                      'STOP_AUTO_PILOT')
    .addItem('Wake Up AI Agent',                 'WAKE_UP_AGENT')
    .addSeparator()
    .addSubMenu(ui.createMenu('Debug Tools')
      .addItem('Force Run AI Now',                  'forceRunAI_Now')
      .addItem('Test Tier 4 AI',             'debug_TestTier4SmartResolution')
      .addItem('Test Gemini Connection',                'debugGeminiConnection')
      .addItem('Reset AI Tags (Selected)',             'debug_ResetSelectedRowsAI')
      .addSeparator()
      .addItem('Test Retrieval Candidates',             'testRetrieveCandidates')
      .addItem('Test AI Response Validation',           'testAIResponseValidation')
      .addSeparator()
      .addItem('Reset SYNC_STATUS',              'resetSyncStatus')
    )
    .addToUi();

  // MENU 4: SYSTEM ADMIN
  ui.createMenu('4. System Admin')
    .addItem('Health Check',          'runSystemHealthCheck')
    .addItem('Cleanup Old Backups',               'cleanupOldBackups')
    .addItem('Check Cell Usage',            'checkSpreadsheetHealth')
    .addSeparator()
    .addSubMenu(ui.createMenu('Diagnostics')
      .addItem('Schema Validation',                  'runFullSchemaValidation')
      .addItem('Engine Diagnostic',               'RUN_SYSTEM_DIAGNOSTIC')
      .addItem('Sheet Diagnostic',                   'RUN_SHEET_DIAGNOSTIC')
      .addSeparator()
      .addItem('Dry Run: Mapping Conflicts',     'runDryRunMappingConflicts')
      .addItem('Dry Run: UUID Integrity',        'runDryRunUUIDIntegrity')
      .addSeparator()
      .addItem('Clear Postal Cache',                      'clearPostalCache_UI')
      .addItem('Clear Search Cache',                      'clearSearchCache_UI')
    )
    .addSeparator()
    .addItem('Setup LINE Notify',                       'setupLineToken')
    .addItem('Setup Telegram Notify',                   'setupTelegramConfig')
    .addItem('Setup API Key',                   'setupEnvironment')
    .addToUi();
}

// =============================================================================
// SECTION 2: SAFETY WRAPPER FUNCTIONS
// =============================================================================

/**
 * Wrapper function to confirm before syncing new customer data
 * @name syncNewDataToMaster_UI
 * @function
 * @returns {void}
 * @description Displays confirmation dialog showing source and destination sheet names
 * @example syncNewDataToMaster_UI();
 */
function syncNewDataToMaster_UI() {
  var ui = SpreadsheetApp.getUi();
  var sourceName = (typeof CONFIG !== 'undefined' && CONFIG.SOURCE_SHEET) 
    ? CONFIG.SOURCE_SHEET 
    : 'Input';
  var dbName = (typeof CONFIG !== 'undefined' && CONFIG.SHEET_NAME) 
    ? CONFIG.SHEET_NAME 
    : 'Database';
  
  var result = ui.alert(
    'Confirm Sync New Data?',
    'System will pull customer data from "' + sourceName + '"\nto "' + dbName + '"\n(Only new records)\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (result == ui.Button.YES) {
    syncNewDataToMaster();
  }
}

/**
 * Wrapper function to confirm AI batch resolution execution
 * @name runAIBatchResolver_UI
 * @function
 * @returns {void}
 * @description Displays confirmation dialog before running AI Smart Resolution
 */
function runAIBatchResolver_UI() {
  var ui = SpreadsheetApp.getUi();
  var batchSize = (typeof CONFIG !== 'undefined' && CONFIG.AI_BATCH_SIZE) 
    ? CONFIG.AI_BATCH_SIZE 
    : 20;
  
  var result = ui.alert(
    'Confirm AI Smart Resolution?',
    'System will analyze up to ' + batchSize + ' unknown records\nusing Gemini AI.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (result == ui.Button.YES) {
    if (typeof resolveUnknownNamesWithAI === 'function') {
      resolveUnknownNamesWithAI();
    } else {
      ui.alert('AI Service Not Installed', 'Please install Service_Agent.gs first.', ui.ButtonSet.OK);
    }
  }
}

/**
 * Wrapper function to confirm finalization and cleanup process
 * @name finalizeAndClean_UI
 * @function
 * @returns {void}
 * @description Displays confirmation dialog before moving verified records
 */
function finalizeAndClean_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    'Confirm Finalize?',
    'Verified records will be moved to NameMapping.\nOriginal data will be backed up.\n\nContinue?',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result == ui.Button.OK) {
    finalizeAndClean_MoveToMapping();
  }
}

/**
 * Wrapper function to confirm Deep Clean memory reset
 * @name resetDeepCleanMemory_UI
 * @function
 * @returns {void}
 * @description Displays confirmation dialog before resetting Deep Clean progress
 */
function resetDeepCleanMemory_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    'Confirm Reset?',
    'System will restart Deep Clean from row 1.\nUse this to re-check all data.',
    ui.ButtonSet.YES_NO
  );
  
  if (result == ui.Button.YES) {
    resetDeepCleanMemory();
  }
}

// =============================================================================
// SECTION 3: GENERIC CONFIRMATION UTILITIES
// =============================================================================

/**
 * Generic confirmation dialog for dangerous operations
 * @name confirmAction
 * @function
 * @param {string} title - Dialog title
 * @param {string} message - Warning message
 * @param {Function} callbackFunction - Function to execute on confirmation
 * @returns {void}
 */
function confirmAction(title, message, callbackFunction) {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(title, message, ui.ButtonSet.YES_NO);
  
  if (result == ui.Button.YES) {
    callbackFunction();
  }
}

/**
 * Wrapper for clearing Data sheet
 * @name clearDataSheet_UI
 * @function
 * @returns {void}
 */
function clearDataSheet_UI() {
  confirmAction('Clear Data Sheet', 'All result data will be deleted.', clearDataSheet);
}

/**
 * Wrapper for clearing Input sheet
 * @name clearInputSheet_UI
 * @function
 * @returns {void}
 */
function clearInputSheet_UI() {
  confirmAction('Clear Input Sheet', 'All shipment data will be deleted.', clearInputSheet);
}

/**
 * Wrapper for repairing NameMapping
 * @name repairNameMapping_UI
 * @function
 * @returns {void}
 */
function repairNameMapping_UI() {
  confirmAction('Repair NameMapping', 'System will remove duplicates and add missing UUIDs.', repairNameMapping_Full);
}

// =============================================================================
// SECTION 4: SYSTEM HEALTH & MONITORING
// =============================================================================

/**
 * Runs system health check
 * @name runSystemHealthCheck
 * @function
 * @returns {void}
 */
function runSystemHealthCheck() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    if (typeof CONFIG !== 'undefined' && CONFIG.validateSystemIntegrity) {
      CONFIG.validateSystemIntegrity(); 
      ui.alert('System Health: Excellent', 'System is ready to operate.', ui.ButtonSet.OK);
    } else {
      ui.alert('System Warning', 'Config check skipped.', ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('System Health: FAILED', e.message, ui.ButtonSet.OK);
  }
}

/**
 * Generates database quality report
 * @name showQualityReport_UI
 * @function
 * @returns {void}
 */
function showQualityReport_UI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  var lastRow = getRealLastRow_(sheet, CONFIG.COL_NAME);
  
  if (lastRow < 2) {
    ui.alert('Database is empty.');
    return;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 17).getValues();
  
  var stats = {
    total: 0, noCoord: 0, noProvince: 0, noUUID: 0,
    noAddr: 0, notVerified: 0, highQ: 0, midQ: 0, lowQ: 0
  };
  
  data.forEach(function(row) {
    if (!row[CONFIG.C_IDX.NAME]) return;
    stats.total++;
    
    var lat = parseFloat(row[CONFIG.C_IDX.LAT]);
    var lng = parseFloat(row[CONFIG.C_IDX.LNG]);
    var q = parseFloat(row[CONFIG.C_IDX.QUALITY]);
    
    if (isNaN(lat) || isNaN(lng)) stats.noCoord++;
    if (!row[CONFIG.C_IDX.PROVINCE]) stats.noProvince++;
    if (!row[CONFIG.C_IDX.UUID]) stats.noUUID++;
    if (!row[CONFIG.C_IDX.GOOGLE_ADDR]) stats.noAddr++;
    if (row[CONFIG.C_IDX.VERIFIED] !== true) stats.notVerified++;
    
    if (q >= 80) stats.highQ++;
    else if (q >= 50) stats.midQ++;
    else stats.lowQ++;
  });
  
  var msg = 'Quality Report\n==============\n';
  msg += 'Total: ' + stats.total + '\n';
  msg += 'High Quality (>=80%): ' + stats.highQ + '\n';
  msg += 'Medium Quality (50-79%): ' + stats.midQ + '\n';
  msg += 'Low Quality (<50%): ' + stats.lowQ + '\n\n';
  msg += 'Missing Data:\n';
  msg += '- No Coordinates: ' + stats.noCoord + '\n';
  msg += '- No Province: ' + stats.noProvince + '\n';
  msg += '- No UUID: ' + stats.noUUID + '\n';
  msg += '- No Address: ' + stats.noAddr + '\n';
  msg += '- Not Verified: ' + stats.notVerified + '\n';
  
  ui.alert(msg);
}

// =============================================================================
// SECTION 5: CACHE MANAGEMENT
// =============================================================================

/**
 * Clears postal code cache
 * @name clearPostalCache_UI
 * @function
 * @returns {void}
 */
function clearPostalCache_UI() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    clearPostalCache();
    ui.alert('Postal Cache Cleared', 'Next lookup will reload from PostalRef sheet.');
    console.log('[Cache] Postal Cache cleared.');
  } catch (e) {
    ui.alert('Error: ' + e.message);
  }
}

/**
 * Clears search cache
 * @name clearSearchCache_UI
 * @function
 * @returns {void}
 */
function clearSearchCache_UI() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    clearSearchCache();
    ui.alert('Search Cache Cleared', 'Next WebApp search will reload NameMapping.');
    console.log('[Cache] Search Cache cleared.');
  } catch (e) {
    ui.alert('Error: ' + e.message);
  }
}
