import { countCommits } from "./app.js";

const template = `<h2>Commit Log Analyzer 
    <button class="btn btn-sm btn-outline-secondary" @click="toggle">
      {{ shouldBeOpen ? 'close' : 'open'}} upload
    </button>
  </h2>

  <div class="upload-box" v-if="shouldBeOpen">
  <p>
    Upload the git log for your main branch, e.g., upload <code>~/gitlog.txt</code> after doing
  </p>
  <pre><code>git log --no-merges --name-status main > ~/gitlog.txt</code></pre>
  <div class="mb-3">
    <input class="form-control" type="file" id="logFile" @change="load">
  </div>
  <p>
    For more about this tool, see <a href="https://github.com/criesbeck/busfactor" target="_blank">the README</a>.
  </p>
  </div>`;

export default {
  props: ['empty', 'load'],
  template,
  data() {
    return {
      forceOpen: false
    }
  },
  computed: {
    shouldBeOpen() {
      return this.empty || this.forceOpen;
    }
  },
  methods: {
    toggle() {
      this.forceOpen = !this.forceOpen;
    }
  }
};