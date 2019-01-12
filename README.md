A simple browser-based application of 
[SheetJS](https://sheetjs.com/) and 
[VueJS](https://vuejs.org/) to flexibly display Excel data in HTML.

See **index.html** for an simple example. No server needs to be run. No
code needs to be installed other than this code.

Being browser-based, the user has to specify the input Excel file. 

To use in an HTML file with Vue templating, include 
the necessary JavaScript (SheetJS, Vue, and xls-vue), create
a Vue object, and call **initXlsVue()** with
the Vue object and the ID of input file element, e.g.,

```
<!DOCTYPE html>
<html>
  ...
  <body>
    <input type="file" id="file-source">
    <div class="container" id="xls-view">
      ...
    </div>
    
    <script src="https://unpkg.com/vue/dist/vue.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.11.17/xlsx.full.min.js"></script>
    <script src="./xls-vue.js"></script>
    <script type="text/javascript">
      const app = new Vue({ el: '#xls-view', data: { ... } });
      initXlsVue(app, 'file-source');
    </script>
  </body>
</html>
```

The spreadsheet should contain one or more worksheets, each with column headers.

The app will parse every worksheet in the spreadsheet, and return a 
JavaScript object with a key for every sheet name. The value for each key will be a
JavaScript array of objects, where the column headers are the keys to the data. See
the documentation on the SheetJS function 
[XLSX.utils.sheet_to_json()](https://docs.sheetjs.com/#json) for details.

For example, with the above example, operating on the sample file **speakers.xlsx** will
set the Vue object data field to 

```
{
  "Speakers": [
    { "Name": ..., "Image": ..., "Url": ..., "Title": ... },
    { "Name": ..., "Image": ..., "Url": ..., "Title": ... },
    ...
  ]
}
```

If you need to process the spreadsheet data before displaying, pass a function
as the third argument to **initXlsVue()**. The function will be passed the parsed spreadsheet
data object, and should return the data you want stored in the Vue object. Each top-level
key of the data object is set with **Vue.set()** to trigger 
[change detection](https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats).