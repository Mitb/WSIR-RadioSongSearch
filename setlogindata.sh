#!/bin/bash

echo "WARNING: The login data for MySQL will appear in plain text in the configuration files within this project's directory!"

#echo "Set MySQL url (currently: )"
#read ADDRESS

echo "Set MySQL username (currently: $(cat radioSolr/data-config.xml  | sed -n 's/^.*user="\(.*\)".*/\1/p'))"
read USR
sed -i 's/\(^.*user="\).*\(".*\)/\1'"$USR"'\2/g' radioSolr/data-config.xml
sed -i 's/\(^.*user="\).*\(".*\)/\1'"$USR"'\2/g' radioSolr/Radio/Radio/solr/Radio/conf/db-data-config.xml
sed -i "s/\( *user[ \t]*: *'\).*\(' *,.*\)/\1$USR\2/g" radioNode/answer_builder.js

echo "Set MySQL password"
read -s PW
sed -i 's/\(^.*password="\).*\(".*\)/\1'"$PW"'\2/g' radioSolr/data-config.xml
sed -i 's/\(^.*password="\).*\(".*\)/\1'"$PW"'\2/g' radioSolr/Radio/Radio/solr/Radio/conf/db-data-config.xml
sed -i "s/\( *password[ \t]*: *'\).*\(' *,.*\)/\1$PW\2/g" radioNode/answer_builder.js




