
#
# Dockerfile for exporter + scrubber application
#

FROM ubuntu:18.04
MAINTAINER Chris Foster chris.foster@twostoryrobot.com

# Install MongoDB tools
RUN apt-get update \
 && apt-get install -y \
      ca-certificates \
      apt-transport-https \
      apt-utils \
      gnupg \
      curl \
 && apt-key adv \
      --keyserver hkp://keyserver.ubuntu.com:80 \
      --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 \
 && echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | \
      tee /etc/apt/sources.list.d/mongodb-org-4.0.list \
 && apt-get update \
 && apt-get install -y mongodb-org-tools=4.0.8

# Install Node
RUN curl https://deb.nodesource.com/setup_10.x | bash - \
 && apt-get install -y nodejs \
 && apt clean

WORKDIR /opt/app
COPY . /opt/app
RUN npm ci

CMD ["npm", "start"]
