FROM debian:buster-slim

ARG IIIF_CANTALOUPE_VERSION

ADD ./entrypoint.sh /entrypoint.sh
RUN ["chmod", "+x", "/entrypoint.sh"]


# Update packages and install tools
RUN mkdir -p /usr/share/man/man1 /usr/share/man/man2
RUN apt-get update -y
RUN apt-get install -y \
  openjdk-11-jre \
  graphicsmagick \
  imagemagick \
  libopenjp2-tools \
  libopenjp2-7 \
  ffmpeg \
  libturbojpeg0 \
  unzip \
  wget

WORKDIR /opt/iiif
RUN mkdir -p /opt/iiif/cache

RUN wget https://github.com/cantaloupe-project/cantaloupe/releases/download/v${IIIF_CANTALOUPE_VERSION}/cantaloupe-${IIIF_CANTALOUPE_VERSION}.zip
RUN unzip cantaloupe-${IIIF_CANTALOUPE_VERSION}.zip
RUN rm cantaloupe-${IIIF_CANTALOUPE_VERSION}.zip
EXPOSE 8080

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
