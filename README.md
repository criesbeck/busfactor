This is a web tool to identify potential bus factor issues for small
cross-functional teams with 5 to 10 members. It uses the output of
**git log** run on a local repository.

# Usage

Run **git log** as follows. Put the output file some place easy to find
but probably not in your repository.

```
git log --no-merges --name-status main > ~/gitlog.txt
```

Upload the file to https://criesbeck.github.io/busfactor/ or serve **index.html** locally
and use that. Nothing is stored on any server.

After uploading, the app displays a table with a row for each code file. Code
file here means a JavaScript, CSS, HTML, or YAML file. The most active files are listed first.
Activity is calculated based on the number and recency of edits. 

The columns of the table list the developers who have contributed to the repository. The cells
show what percentage each developer contributed to the activity on each file.

Developers who have contributed less than 5% to a file are highlighted. 
These developers should be first in line for future work on those files.

Files with only one or two contributors over 5% are bus factor risks and are highlighted. 
Future work on that file should include other team members. 

# Customization

Clone this repository. 

To change what files are tracked, edit the regular expressions in  **EDIT_PAT**.

To change the threshold for being an active contributor, change **THRESHOLD**.