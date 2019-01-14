A simple application of 
[SheetJS](https://sheetjs.com/) and 
[VueJS](https://vuejs.org/) to display Excel data in HTML. The data can be in
a file on the server or a user-selected local file.

If *app* is a Vue component, and *file.xlsx* is an Excel file on the 
server, then 

```
viewRemoteXls(app, './file.xlsx');
```

returns a promise that sets the data in *app* to the parsed data in
*file.xlsx*. 

To use the data in a local user-selected file, call **viewLocalXls** in
the event handler for a file input element

```
document.getElementById('file-source')
  .addEventListener('change', (evt) => {
    viewLocalXls(evt, app);
  });
```

See **index.html** for a simple example.

The spreadsheet may have multiple worksheets. Each sheet should have column
headers. Each sheet name become a top-level key in the parsed data, and the value
of each key become an array of objects, where the column headers are the keys to the data. 
See 
[XLSX.utils.sheet_to_json()](https://docs.sheetjs.com/#json) for details.

For example, with the above example, operating on the sample file **poets.xlsx** will
set the Vue object data field to 

```
{
  "poets": [
    { "Name": ..., "Image": ..., "Url": ..., "Title": ... },
    { "Name": ..., "Image": ..., "Url": ..., "Title": ... },
    ...
  ]
}
```

If you need to process the spreadsheet data before displaying, pass a function
as the third argument to the view function, to
take the parsed spreadsheet and return the data you want used.

Note: **Vue.set()** is called on each sheet name to trigger 
[change detection](https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats).