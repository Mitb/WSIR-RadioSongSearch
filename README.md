WSIR-RadioSongSearch
====================

Web Search &amp; Information Retrieval - Radio Song Search Project


This is a project developed by 3 students as part of the lecture "Web Search &amp; Information Retrieval" in the Masters programm of the university of Mannheim.
The purpose of this project was to gain some practical insights in the development of a search service. The project realizes a search on music data that has been crawled.

The project consists of different parts:
- A javascript based UI
- A node.js backend
- An Apache SolR Server
- A MYSQL database


To prevent wasting Github storrage we do not include the acctual data that is required to run the project within this repository.
It will be provided using a different channel.


Installation:
=============

- Load data from external source (link will be provided soon)
- Install MYSQL, Execute the CREATE_TABLE script and import the data.
- Install Node.js
- Download the Sources from Github
- Configure the database access for:
	- For node.js in: radioNode/answer_builder.js
	- For SolR in: radioSolr/Radio/Radio/solr/Radio/conf/db-data-config.xml



Start:
======

- Start the MYSQL-DB
- Start SolR: Execute radioSolr/Radio/run (Shellscript)
- Start Node: "node radioNode/exserver.js"



Build Indizes:
==============

- Execute: radioSolr/customScripts/buildIndex.sh (Shellscript)



Access &amp; Experience the search:
===================================

- Access http://localhost:8889




