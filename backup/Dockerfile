
#
# Dockerfile for daily MongoDB backups
#

FROM openshift/mongodb:3.2
MAINTAINER Chris Foster chris.foster@twostoryrobot.com
WORKDIR /backup

# Default mongo container is not permissioned
USER root

# Install cron
RUN yum -y install cronie \
  && yum clean all -y

# Add files
COPY crontab .
COPY backup .
COPY start .

# Register crontab
RUN crontab ./crontab

CMD [ "/backup/start" ]
