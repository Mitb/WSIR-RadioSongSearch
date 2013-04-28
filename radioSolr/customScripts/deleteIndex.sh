curl http://localhost:8983/solr/Radio/update -H "Content-type: text/xml" --data-binary '<delete><query>*:*</query></delete>'
sleep 5
curl http://localhost:8983/solr/Radio/update -H "Content-type: text/xml" \
 --data-binary '<commit />'
sleep 5
curl http://localhost:8983/solr/Radio/update -H "Content-type: text/xml" \
 --data-binary '<optimize />'
