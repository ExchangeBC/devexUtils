
#
# Dockerfile for daily MongoDb backups
#

FROM openshift/mongodb:3.2
MAINTAINER Chris Foster chris.foster@twostoryrobot.com
WORKDIR /backup

# Install cron
RUN apt-get update \
    && yum install cron 

# Add files
COPY crontab .
COPY backup .
COPY start .

# Register crontab
RUN crontab ./crontab

CMD [ "/rethink-to-s3/start" ]
