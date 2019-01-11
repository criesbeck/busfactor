'use strict';

let app = new Vue({
  el: '#app',
  data: {
    headers: [],
    rows: [ [] ]
  }
});

let rawData = {};

let options = {};

// Columns to omit
// Should be in settings.xls

options.ignoreHeaders = ['App Type', 'MS Consideration', 'Cluster Selection',
  'Custom Field 1 Description', 'Custom Field 1',
  'Custom Field 2 Description', 'Custom Field 2',
  'Prev College Inst 4', 'Prev College Inst Deg 4',
  'Prev College Inst 5', 'Prev College Inst Deg 5',
  'Enrollment Decision Response'
  ];


// Scoring functions. Should return an object with a score and optional note.
// Scores should be 0..5, higher better.
// Include a note pro or con, when worth mentioning, e.g., school, very high or very low TOEFL.
let analyzers = {
  US: row => {
    return isCitizen(row) ?  { score: 5, pro: 'US' } : { score: 0 };
  },
  Language: row => {
    let data = getEnglishData(row['TOEFL'], row['Overall #']);
    let score = Math.max(0, Math.ceil((data.value - 89) / 6));
    return { 
      score: score,
      pro: data.value >= 105 ? data.name + ':' + data.score : null,
      con: data.name && data.value < 90 ? data.name + ':' + data.score 
      : !data.name && !isCitizen(row) ? 'no TOEFL'
      : null
    };
  },
  Writing: row => {
    let val = row['WA #'] || '?';
    let n = getNumber(val);
    let score = n > 4 ? 2 : n === 4 ? 1 : 0;
    return { 
      score: score, 
      pro: name > 4 ? 'WA #:' + val : null,
      con: n < 3.5 ? 'WA #:' + val : null
    };
  },
  GREQ: row => {
    let val = row['GRE Q%'] || '?';
    let n = getNumber(val);
    let score = Math.max(0, Math.ceil((n - 69) / 6));
    return { 
      score: score, 
      pro: n >= 90 ? 'GRE Q%:' + val : null,
      con: n <= 75 ? 'GRE Q%:' + val : null
    };
  },
  GPA: row => {
    let val = row['Undergrad GPA'] || '?';
    let gpa = getNumber(val);
    let score = Math.max(0, Math.min(5, Math.round((gpa - 3) / 0.1)));
    return { 
      score: score,
      pro: gpa > 3.3 ? 'GPA ' + gpa : null,
      con: gpa > 0 && gpa <= 3 ? 'GPA ' + gpa : null
    };
  },
  School: row => {
    let val = row['Prev College Inst 1']
    let score = !val ? 0 : schoolRank(val);
    return { score: score, pro: score > 0 ? val + ' (' + score + ')' : null };
  },
  Major: row => {
    let val = row['Major 1']
    let score = !val ? 0 : majorScore(val);
    return { score: score, pro: score > 0 ? val : null, con: score <= 0 ? val : null };
  },
  URM: row => {
    let val = getEthnicity(row);
    return val ? { score: 5, pro: val } : { score: 0 };
  },
  Female: row => {
    let val = row['Gender'];
    return val && val === 'F' ? { score: 2, pro: 'Female' } : { score: 0 };
  },
  LOR: row => {
    if (row['Application Complete?'] == 'Yes') return { score: 2 };
    let val = getNumber(row['# LORs Received'] );
    return val < 2 ? { score: 0, con: '#LOR:' + val } : { score: 2 };
  },
  Admission: row => {
    let val = row['SES Decision/Status'];
    return (val == 'DENY' || val == 'WAPP') ? { score: 0, con: 'Status:' + val }
    : (val == 'ADMT' || val == 'DEIN') ? { score: 5, pro: 'Status:' + val }
    : { score: 0 };
  }
};

// treat non-numbers like "NA" as zero
function getNumber(val) {
  let n = Number.parseFloat(val);
  return Number.isNaN(n) ? 0 : n;
}

function getEnglishData(toeflText, ieltsText) {
  let toefl = getNumber(toeflText);
  let ielts = getNumber(ieltsText);
  return (toefl || ielts) ? { 
    name: toefl ? 'TOEFL' : 'IELTS', 
    score: toefl || ielts,
    value: + (toefl || ieltsToToefl(ielts))
  } : { value: 0 };
}

// https://magoosh.com/ielts/whats-your-ielts-percentile/
function ieltsToToefl(ielts) {
  return ielts >= 9 ? 119 :
    ielts >= 8.5 ? 116 :
    ielts >= 8 ? 112 :
    ielts >= 7.5 ? 105 :
    ielts >= 7 ? 97 :
    ielts >= 6.5 ? 83 :
    ielts >= 6 ? 65 :
    ielts >= 5.5 ? 52 :
    ielts >= 5 ? 40 :
    ielts >= 4.5 ? 33 :
    31;
}

function getEthnicity(row) {
  let ethnicity = row['Ethnicity'];
  let hispanic = row['Hispanic'];
  return (ethnicity && (ethnicity.indexOf('BLACK') !== -1 || ethnicity.indexOf('AMIND') !== -1)) ?
    titleCase(ethnicity) :
   (hispanic && hispanic === 'Y') ? 'Hispanic' : '';
}

function schoolRank(name) {
  return applyScoreRows(name, options.schoolRankings);
}

function majorScore(major) {
  return applyScoreRows(major, options.majorScores);
}

function applyScoreRows(data, rows) {
  let text = data.toLowerCase();
  let row = !rows ? 0 : rows.find(row => row.slice(1).some(cell => text.indexOf(cell) !== -1));
  return row ? + row[0] : 0;
}

function isCitizen(row) {
  let val = row['Citizenship Status'];
  return val && val.indexOf('U.S.') !== -1;
}

function hasString(text, subtext) {
  return text.toLowerCase().indexOf(subtext) !== -1;
}

// single word only
function titleCase(text) {
  return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1).toLocaleLowerCase() : text;
}

// read xlsx file use SheetJS -- http://sheetjs.com/
// assumes just one worksheet, with one header row
// passes data to proc
// if json, make JSON object, else make 2D array

function readFile(e, fn, options) {
  let files = e.target.files, file = files[0];
  if (!file) {
    alert('No file specified');
    return;
  }
  let reader = new FileReader();
  reader.onload = function(e) { fn(e, options); };
  reader.readAsBinaryString(file);
}

// loads the application spreadsheet
function readApplications(e) {
  let workbook = XLSX.read(e.target.result, { type: 'binary' });
  let ws = workbook.Sheets[workbook.SheetNames[0]];
  loadApplications(XLSX.utils.sheet_to_json(ws, null));
}

// load the configuration spreadsheets
function readConfigurations(e, options) {
  let workbook = XLSX.read(e.target.result, { type: 'binary' });
  Object.keys(options).forEach(key => {
    let option = options[key];
    let json = option.type === 'json';
    let ws = workbook.Sheets[key];
    if (ws) {
      option.call(XLSX.utils.sheet_to_json(ws, json ? null : { header: 1 }));
    }
  });
  // reprocess application data already loaded
  if (rawData && Object.keys(rawData).length > 0) loadApplications(rawData);
}

// loading and analyzing applications

function isApplicantFile(wsName) {
  return wsName.indexOf('Northwestern - Admit') > -1;
}

// Note: columns filtered out by keepColumn are still available for filtering by keepRow
function loadApplications(data) {
  rawData = data;
  app.headers = ['PDF', 'Pro', 'Con', 'Score'].concat(Object.keys(data[0]).filter(keepColumn));
  app.rows = data.slice(1)
    .filter(keepRow)
    .map(analyzeRow)
    .sort(byScoreAndSubmissionDate)
    .map(row => app.headers.map(key => row[key]));
}

function keepColumn(header) {
  return options.ignoreHeaders.indexOf(header) == -1;
}

function keepRow(row) {
  return !options.keepFilter ||
    Object.keys(options.keepFilter).every(key => options.keepFilter[key].includes(row[key]));
}

// descending sort
function byScore(row1, row2) {
  return row2.Score - row1.Score;
}

// descending on score, ascending on dates
function byScoreAndSubmissionDate(row1, row2) {
  let scoreCompare = row2.Score - row1.Score;
  let dateCompare = new Date(row1['Submission Date']) - new Date(row2['Submission Date']);
  return scoreCompare || dateCompare;
}

function analyzeRow(row) {
  addPdfLink(row);
  let keys = Object.keys(analyzers);
  let pro = [];
  let con = [];
  keys.forEach(key => {
    let result = analyzers[key](row);
    if (result === undefined) {
      alert('undefined result for ' + key + ' with ' + row)
    }
    row[key] = result.score;
    if (result.pro) {
      pro.push(result.pro);
    }
    if (result.con) {
      con.push(result.con);
    }
  });
  row.Pro = pro.join(', ');
  row.Con = con.join(', ');
  row.Score = integerScore(keys.reduce((sum, key) => sum + weightedScore(row, key), 0));
  return row;
}

function integerScore(score) {
  return Math.round(score * 100);
}

function weightedScore(row, key) {
  return row[key] * getWeight(key);
}

function getWeight(key) {
  const weight = options.weights[key];
  return weight === undefined ? options.weightDefault : weight;
}

function addPdfLink(row) {
  let name = (row['Last Name'] + '_' + row['First Name']).replace(/[^a-zA-Z_-]/g, '');
  let pdf = name + '_' + row['App ID'] + '.pdf';
  row.PDF = '<a href="pdfs/' + pdf + '" target="_blank">PDF</a>';
}

// loading spreadsheet with scoring options

function loadSettings(evt) {
  readFile(evt, readConfigurations, { 
    Schools: { call: loadSchools, type: 'array' },
    Filters: { call: loadFilters, type: 'array' },
    Majors: { call: loadMajors, type: 'array' },
    Weights: { call: loadWeights, type: 'array' }
  });
  return false;
}

function loadSchools(data) {
  let rankings = removeEmptyData(data).map(lowerCaseScoreRow);
  options.schoolRankings = rankings;
}

function loadFilters(data) {
  let filters = removeEmptyData(data);
  let keepFilter = filters.reduce((obj, row) => (obj[row[0]] = row.slice(1), obj), {});
  options.keepFilter = keepFilter;
}

function loadMajors(data) {
  let majorScores = removeEmptyData(data).map(lowerCaseScoreRow);
  options.majorScores = majorScores;
}

function loadWeights(data) {
  const weightArray = removeEmptyData(data)
  const weightSum = weightArray.reduce((sum, row) => sum + (+ row[1]), 0);
  const weights = weightsToJson(weightArray, weightSum);
  options.weights = weights;
  options.weightDefault = 1 / weightSum;
}

function weightsToJson(lst, sum) {
  const obj = {};
  lst.forEach((row) => { obj[row[0]] = row[1] / sum; });
  return obj;
}

function removeEmptyData(data) {
  return data.map(row => row.filter(cell => cell && cell.length > 0)).filter(row => row.length > 0);
}

function lowerCaseScoreRow(row) {
  return [+ row[0]].concat(row.slice(1).map(cell => cell.toLowerCase()));
}

document.getElementById('ms-file')
  .addEventListener('change', evt => readFile(evt, readApplications));
document.getElementById('options-file')
  .addEventListener('change', loadSettings);