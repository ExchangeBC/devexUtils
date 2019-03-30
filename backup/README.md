# devex-backup

Container that daily backs up Mongo to a provisioned volume

# How to Use

Basic usage is as follows:

```
docker run \
  -e "MONGODB_URI=mongodb://user:pass@host:port/database" \
  backup
```

This will start cron in the background which will run an upload script daily.
All of the databases will be exported from the provided MongoDB database and
put into a file in the format of `backup-{day of week} ({date}).gz`. This will
be stored on the `/backup/` directory, where you should mount a persistent 
volume.

**Rotation**: Backups are stored for one week, by the day of the week they were
created. Once seven days of backups are present, the backup for a given day of
the week will be deleted and replaced by the new backup for that day.
