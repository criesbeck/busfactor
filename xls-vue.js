'use strict';

// loads the application spreadsheet
function displayData(e, target) {
  const workbook = XLSX.read(e.target.result, { type: 'binary' });
  const data = {};
  workbook.SheetNames.forEach((name) => {
    data[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
  })
  new Vue({ el: `#${target}`, data });
}

// read xlsx file use SheetJS -- http://sheetjs.com/
// assumes just one worksheet, with one header row
// passes data to fn
// if json, make JSON object, else make 2D array

function handleFileSelect(evt, target) {
  const reader = new FileReader();
  reader.onload = (evt) => { displayData(evt, target); };
  reader.readAsBinaryString(evt.target.files[0]);
}

function initXlsVue({ fileSource, target }) {
  document.getElementById(fileSource)
    .addEventListener('change', evt => handleFileSelect(evt, target), false);
}