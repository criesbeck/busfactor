import { countCommits } from "./app.js";

const template = `<div v-if="authors.length > 0">
  <h1>Gitstats</h1>
  <p>
    Zeros and ones suggest an underlying obstacle to participation. Investigate!
  </p> 
  <table class="table">
    <thead>
      <th>Name</th>
      <th>Total</th>
      <th v-for="week in weeks">{{week}}</th>
    </thead>
    <tbody>
      <tr v-for="author in authors">
        <td>{{author}}</td>
        <td>{{totalCommits(author)}}</td>
        <td v-for="week in weeks">
          {{weekCommits(author, week)}}
        </td>
      </tr>
    </tbody>
  </table>
</div>`;

export default {
  props: ['authors', 'commits', 'weeks'],
  template,
  methods: {
    weekCommits(author, week) {
      return countCommits(this.commits[author], week);
    },
    totalCommits(author) {
      return this.commits[author].length;
    }
  }
};