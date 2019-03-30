
#
# Dockerfile for daily MongoDB backups
#

FROM ubuntu:18.04
MAINTAINER Chris Foster chris.foster@twostoryrobot.com
WORKDIR /opt/backup

# Install MongoDB tools
RUN apt-get update \
 && apt-get install -y \
      ca-certificates \
      apt-transport-https \
      apt-utils \
      gnupg \
 && apt-key adv \
      --keyserver hkp://keyserver.ubuntu.com:80 \
      --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 \
 && echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | \
      tee /etc/apt/sources.list.d/mongodb-org-4.0.list \
 && apt-get update \
 && apt-get install -y mongodb-org-tools=4.0.8 \
 && apt clean

# Add user-level compatible cron
ARG SOURCE_REPO=BCDevOps
ARG GOCROND_VERSION=0.6.2
ADD https://github.com/$SOURCE_REPO/go-crond/releases/download/$GOCROND_VERSION/go-crond-64-linux \
    /usr/bin/go-crond

# Output directory
VOLUME /backups

# Adjust permissions for user-level
RUN chmod ug+x /usr/bin/go-crond 
 && chmod ug+w /backups/
 && usermod -g root backup

# Add project files
COPY crontab .
COPY backup .
COPY start .

# Run as user account
USER backup

CMD [ "/opt/backup/start" ]
