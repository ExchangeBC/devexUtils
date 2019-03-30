
#
# Dockerfile for daily MongoDB backups
#

FROM ubuntu:18.04
MAINTAINER Chris Foster chris.foster@twostoryrobot.com
WORKDIR /backup

# Install basic deps
RUN apt-get update \
    && apt-get install -y cron ca-certificates apt-transport-https apt-utils gnupg

# Install MongoDB
RUN apt-key adv \
     --keyserver hkp://keyserver.ubuntu.com:80 \
     --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 \
  && echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | \
     tee /etc/apt/sources.list.d/mongodb-org-4.0.list \
  && apt-get update \
  && apt-get install -y mongodb-org-tools=4.0.8

# Clean apt artifacts
RUN apt clean

# Add files
COPY crontab .
COPY backup .
COPY start .

# Register crontab
RUN crontab ./crontab

CMD [ "/backup/start" ]
