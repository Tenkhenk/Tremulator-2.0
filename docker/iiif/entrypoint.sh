#!/bin/bash
cd /opt/iiif/cantaloupe-${IIIF_CANTALOUPE_VERSION}

java -Dcantaloupe.config=/opt/iiif/cantaloupe.properties -Xmx${IIIF_HEAP_XMX} -jar cantaloupe-${IIIF_CANTALOUPE_VERSION}.war
