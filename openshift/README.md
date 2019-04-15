# devexutils-openshift

This provides openshift templates for deploying the devex utilities. The 
Openshift template resources are broken into two categories: the build template 
and the environment template. The build template creates resources for the 
build configurations, which belong in your "tools" project. The other 
resources, the environment, are the actual instances and they belong in your 
production / staging / testing projects.

## How to deploy

First, deploy the tools template:

```
> oc project my_tools
> oc process \
  -f devexutils-build-template.yaml \
  --param-file=build.env | oc apply -f -
```

Your `build.env` file might look like the following:

```
TAG=latest
SUFFIX=-staging
SOURCE_REPOSITORY_URL=https://github.com/BCDevExchange/devexUtils
SOURCE_REPOSITORY_REF=master
```

You might have to manually trigger both builds at this point, as the template 
does not automatically configure webhooks for you. 

Now, you can deploy the environment template:

```
> oc project my_environment
> oc process \
  -f devexutils-environment-template.yaml \
  --param-file=environment.env | oc apply -f -
```

Your `environment.env` might look like the following:

```
SUFFIX=-staging
SCRUBBER_KEY=s3cure
BACKUP_CAPACITY=35Gi
HOSTNAME=https://myscrubber.gov.bc.com
MONGODB_URI=mongodb://user:password@server:27017/database
IMAGESTREAM_SUFFIX=-staging
IMAGESTREAM_NAMESPACE=my-tools
IMAGESTREAM_TAG=latest
```

See the template files for details on all accepted parameters and default 
values.

## Notes on permissions

The `MONGODB_URI` that you provide is used for backups, scrubbed database 
exports, and database imports. In the case of imports, the entire database will 
be dropped before the import begins. Because of this, it's important that you 
consider the access credentials you wish to provide `MONGODB_URI` and that you 
keep the `SCRUBBER_KEY` secret.

If you'd like to be able to import databases, the user that you specify in the
authentication field of the `MONGODB_URI` must have permissions to drop the 
database. If you'd like to ensure that this is not possible, make sure this 
user has read-only permission to the database. Depending on the environment you 
are deploying you may make one decision over the other.

Under the default OpenShift Mongo image, it creates a user with write access to 
the database, but not drop access. It also creates an administrative user. If 
you'd like to enable permissions to drop the database, you can either add those 
permissions to the normal user, create a new user with those permissions for 
the database, or use the admin credentials like so:

```
DB_URI=mongodb://admin:{ADMIN_PASS}@host:2017/database?authSource=admin
```

The `authSource=admin` flag tells Mongo to look for the admin user's 
credentials in a different database than the specified one in the URI.

To ensure that the container can only export and backup, you can provide the 
default user credentials which do not have permissions to drop the database and 
the import should fail. However, it is better practice to create a separate 
user that has read only permissions to the database and use those credentials.
