'use strict';

// loads the application spreadsheet
function displayData(e, app, postProcess) {
  const workbook = XLSX.read(e.target.result, { type: 'binary' });
  workbook.SheetNames.forEach((name) => {
    Vue.set(app, name, postProcess(XLSX.utils.sheet_to_json(workbook.Sheets[name]), name));
  });
}

// read xlsx file use SheetJS -- http://sheetjs.com/
// assumes just one worksheet, with one header row
// passes data to fn
// if json, make JSON object, else make 2D array

function handleFileSelect(evt, app, postProcess) {
  const reader = new FileReader();
  reader.onload = (evt) => { displayData(evt, app, postProcess); };
  reader.readAsBinaryString(evt.target.files[0]);
}

function initXlsVue(app, fileSource, postProcess = x => x) {
  document.getElementById(fileSource)
    .addEventListener('change', (evt) => {
      handleFileSelect(evt, app, postProcess);
    });
}