'use strict';

// loads the application spreadsheet
function getData(rawData, type) {
  const workbook = XLSX.read(rawData, { type });
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

async function viewRemoteXls(app, url, postProcess = x => x) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  const buf = await response.arrayBuffer();
  setData(app, postProcess(getData(new Uint8Array(buf), 'array')));
}

function viewLocalXls(evt, app, postProcess = x => x) {
  const reader = new FileReader();
  reader.onload = (evt) => { 
    setData(app, postProcess(getData(evt.target.result, 'binary')));
  };
  reader.readAsBinaryString(evt.target.files[0]);
}
