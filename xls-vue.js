'use strict';

// loads the application spreadsheet
function getData(evt) {
  const workbook = XLSX.read(evt.target.result, { type: 'binary' });
  const data = {};
  workbook.SheetNames.forEach((name) => {
    data[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
  });
  return data;
}

function setData(app, data) {
  Object.keys(data).forEach((key) => {
    Vue.set(app, key, data[key]);
  });
}

// read xlsx file use SheetJS -- http://sheetjs.com/
// assumes just one worksheet, with one header row
// passes data to fn
// if json, make JSON object, else make 2D array

function handleFileSelect(evt, app, postProcess) {
  const reader = new FileReader();
  reader.onload = (evt) => { setData(app, postProcess(getData(evt))); };
  reader.readAsBinaryString(evt.target.files[0]);
}

function initXlsVue(app, fileSource, postProcess = x => x) {
  document.getElementById(fileSource)
    .addEventListener('change', (evt) => {
      handleFileSelect(evt, app, postProcess);
    });
}