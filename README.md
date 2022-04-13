This is a web tool to identify potential team and bus factor issues for small
cross-functional teams with 5 to 10 members. It analyzes the output of
**git log** run on a local repository.

# Usage

Run **git log** as follows. Put the output file some place easy to find
but probably not in your repository.

```
git log --no-merges --name-status main > ~/gitlog.txt
```

Upload the file to https://criesbeck.github.io/busfactor/ or serve **index.html** locally
and use that. Nothing is stored on any server.

# Output

After uploading, the app displays two tables. 

## Commits

The first table is a summary of commits
per week by each team member since the start of the project. This is comparable to
the **Contributors** section of the **Insight**
page of the repo on Github, except that delete commits are not counted, and 
the dates are the end of each week. For
example, the column **3/6/2022** has the commits for each team member for the week
that ended on March 6, 2022. 

Commits are not a measure of work or value. Some commits are trivial, some are major.
But a team should always be concerned when there are team members with fewer than two commits
in a week.

## Bus factor

The second table identifies potential bus factor issues, meaning active files
that only one or two team members have worked on. This table has a row for each code file. Code
file here means a JavaScript, CSS, HTML, or YAML file. The most active files are listed first.
Activity is calculated based on the number and recency of edits. 

The columns of the table list the developers who have contributed to the repository. The cells
show what percentage each developer contributed to the activity on each file.

![Example contributions](./images/bus-factor-1.png)

Developers who have contributed less than 5% to a file are highlighted. 
These developers should be first in line for future work on those files.

Files with only one or two contributors over 5% are bus factor risks and are highlighted. 
Future work on that file should include other team members.

![Example bus factor](./images/bus-factor-2.png)

# Customization

Clone this repository. 

To change what files are tracked, edit the regular expressions in  **EDIT_PAT**.

To change the threshold for being an active contributor, change **THRESHOLD**.