// ============================================================
// Uma Churrasqueira — Google Apps Script
// Paste this entire file into script.google.com
// ============================================================

const SHEET_NAME = 'Reservations';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data   = JSON.parse(e.postData.contents);
    const sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const action = data.action;

    if (action === 'submit') {
      // Ensure headers exist on first run
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Timestamp','Name','Email','Phone','Date','Time','Guests','Notes','Status','Comment']);
      }
      sheet.appendRow([
        new Date().toLocaleString('en-GB'),
        data.name   || '',
        data.email  || '',
        data.phone  || '',
        data.date   || '',
        data.time   || '',
        data.guests || '',
        data.notes  || '',
        'Pending',
        '',
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'update') {
      const rowNum   = parseInt(data.row) + 1; // +1 for header row
      const newStatus = data.status  || 'Pending';
      const comment   = data.comment || '';
      sheet.getRange(rowNum, 9).setValue(newStatus); // Column I = Status
      sheet.getRange(rowNum, 10).setValue(comment);  // Column J = Comment
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'list') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rows  = sheet.getDataRange().getValues();

    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ reservations: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const reservations = rows.slice(1).map((row, i) => ({
      row:       i + 1,
      timestamp: row[0] ? String(row[0]) : '',
      name:      row[1] || '',
      email:     row[2] || '',
      phone:     row[3] || '',
      date:      row[4] || '',
      time:      row[5] || '',
      guests:    String(row[6] || ''),
      notes:     row[7] || '',
      status:    row[8] || 'Pending',
      comment:   row[9] || '',
    }));

    return ContentService
      .createTextOutput(JSON.stringify({ reservations }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
