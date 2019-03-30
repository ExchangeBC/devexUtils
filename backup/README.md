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
All of the databases will be exported from the provided RethinkDB database and
put into a file in the format of `rethinkdb_dump_<date>_<time>.tar.gz`. This
export will be uploaded to the root of the provided S3 bucket.

# Security Best Practices

To perform the backup, only one permission is needed: `s3:PutObject`. You should
create a separate Managed Policy which can be assigned to a user with this 
permission. Additionally, you should limit the permission to only the bucket
you plan to upload to. Your policy will look something similar to this:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1291030123918",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::my-container/*"
            ]
        }
    ]
}
```

You should create a separate user in your AWS IAM console to perform the 
backups. This user does not need a password, so they should only have the 
'Programmatic access' Access Type. AWS will provide a `AWS_ACCESS_KEY_ID` and
`AWS_SECRET_ACCESS_KEY` for that user. Assign the Managed Policy that you 
created to this user, and provide no other permissions to it.

In the event that your container or host system is compromised, an attacker will
have a key which can only write output to the container and cannot read the 
backups or perform any other operations on your AWS account. However, you should
keep in mind that the `RETHINK` environment variable could still be used to gain
full access to all of your live data, so secure your systems as always.
