#PDF Link Finder
================

This web utility will take any number of PDF files read them and 
extract the URL or URL like matches returning the results in tabular format. 

My original intention was to also validate the URLs that were provided to see
if they were still valid. This has proved problematic as not all URL have 
protocol prefixes.

TODO List:
- Clean up L&F
-- Add paging when more than 100 links are returned 
-- Fix how items are appended to the table to make railroading consistent
-- Alter the boarder behavior on rows when reporting on particular files
- Add Sorting Behavior by File Name
- Change results to be displayed after all files have been analyzed 
- Validate links which have a provided protocol
- Add a trimming option for instance I'm picking up the char ')' in some results