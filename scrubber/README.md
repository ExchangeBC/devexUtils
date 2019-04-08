# devexutils-scrubber

This container provides the ability to export an existing BCDevEx database, 
scrub it of all sensitive information, and then release it for download. This 
can be used for generating a realistic dataset for use in staging and testing
environments. It also provides an endpoint for importing the scrubbed archives 
to a database.

## How to use

Basic usage is as follows:

```
docker run \
  --link mongo:mongo
  -e DB_URI=mongodb://mongo:27017/devex
  -e TMP_DB_URI=mongodb://tmpmongo:27107/tmp
  -e KEY=secure_key
  -p 3000:3000
  devexutils-export
```

The `DB_URI` is the database that will be exported from and imported to. The
`TMP_DB_URI` is an emphemeral MongoDB database, to which the user must have 
database admin privileges. The `TMP_DB_URI` should not be a production database
as it may receive heavy burst loads during the export or import.

The `KEY` is a secret parameter which should not be shared, as it allows uploads
to the database specified by `DB_URI`.

## Generating a scrubbed export

You can perform an export with curl:

```
> curl https://mydevex.dev/export?key=secure_key --output scrubbed.gz
```

## Performing an import

You can perform an import with curl as well:

```
> curl -XPOST -F 'data=@scrubbed.gz' https://mydevex.dev/import?key=secure_key
```
