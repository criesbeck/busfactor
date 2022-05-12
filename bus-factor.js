import { isActiveContributor } from "./app.js";

const template = `<div v-if="files.length > 0">
  <h1>Bus Factor Analysis</h1>
  <p>
    Files in pink near the top need more contributors. Developers in yellow
    for specific files could use experience editing those files.
  </p> 
  <table class="table">
    <thead>
      <th>File</th>
      <th v-for="author in authors">{{author}}</th>
    </thead>
    <tbody>
      <tr v-for="entry in files">
        <td :class="{ risky: entry.actives < 3 }">
          <small>{{pathPart(entry.file)}}</small>
          <div>{{filePart(entry.file)}}</div>
          <small>
            Edits: {{entryEdits(entry)}}
          </small>
        </td>
        <td v-for="author in authors" :class="{ low: !isActiveContributor(entry, author) }">
          <div>{{authorContribution(entry, author)}}%</div>
          <small>Edits: {{entry.authors[author].edits.length}}</small>
          <small> {{shortDate(entry.authors[author].edits[0])}}</small>
        </td>
      </tr>
    </tbody>
  </table>
</div>`;

export default {
  props: ['files', 'authors'],
  template,
  methods: {
    pathPart(filename) {
      const n = filename.lastIndexOf('/');
      return n === -1 ? '' : filename.slice(0, n + 1);
    },
    filePart(filename) {
      const n = filename.lastIndexOf('/');
      return n === -1 ? filename : filename.slice(n + 1);
    },
    shortDate(date) {
      return date ? new Date(date).toLocaleDateString() : '--'
    },
    entryEdits(entry) {
      return Object.values(entry.authors).reduce((sum, author) => sum + author.edits.length, 0);
    },
    entryLastEdit(entry) {
      const val = (date) => date ? Date.parse(date) : 0;
      return this.shortDate(Object.values(entry.authors).map(x => x.edits[0]).sort((date1, date2) => (
        val(date2) - val(date1)
      ))[0]);
    },
    authorEdits(file, author) {
      return this.data.history[file].authors[author].edits.length;
    },
    authorLastEdit(file, author) {
      return this.shortDate(this.data.history[file].authors[author].edits[0]);
    },
    authorContribution(fileEntry, author) {
      return Math.ceil(fileEntry.authors[author].frecency/fileEntry.frecency*100);
    },
    isActiveContributor(fileEntry, author) {
      return isActiveContributor(fileEntry.frecency, fileEntry.authors[author]);
    }
  }
};