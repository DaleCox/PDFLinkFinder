#PDF Link Finder
================

This web utility will take any number of PDF files read them and 
extract the URL or URL like matches returning the results in tabular format. 

My original intention was to also validate the URLs that were provided to see
if they were still valid. This has proved problematic as not all URL have 
protocol prefixes and I've addressed the CORS issues by creating a Node.js server component, scanner works great now. 

This applicaiton is hosted as a Node web app on Microsoft Azure - http://pdflinkfinder.azurewebsites.net/static/index.html  


TODO List:
- Clean up L&F
  - Add paging when more than 100 links are returned 
  - Consider using bootstrap 
- Add Sorting Behavior by File Name
- Change results to be displayed after all files have been analyzed 
- Make link validation more consistant
- Add a trimming option for instance I'm picking up the char ')' and '.' in some results
- Explore matching on '://'
- Make link validation selectable 
- Make link matching more configurable
- Let the user choose between client side and server side validation. 