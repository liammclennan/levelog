Levelog
=====

Simple, network append-only datastore. 

Summary
-----

Network append-only datastores like Kafka, Kinesis and Event Hubs are becoming more popular, but each of these systems is a substantial effort to setup, or only runs inside someones cloud. Levelog is a simple append-only datastore that should run nearly anywhere. 

Multiple consumers can safely read from the same log, because each consumer maintains their own cursor (the last key read). The keys are the number of milliseconds since 1 January 1970 00:00:00 UTC. This information can be used to query by a time range.  

Levelog uses Leveldb to store the data, hence the name. Levelog is essentially an application specific http wrapper around leveldb. 

Install and Start
------

```
> npm install
> node index.js
```

Inserting Data
------

Post JSON to the log. 

```
curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"
name": "Bob", "age":"34"}'
```

to write multiple records in a single transaction just post an array:

```
curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '[{"
name": "Bob", "age":"34"}, {"name": "Denise", "age":"24"}]'
```

Read Data
------

Read from an offset in the log, to another offset in the log. Note that keys are in lexicographical order. To read from `1433564092908` to `2`:

```
curl -v http://localhost:3000/1433564092908/2
```

Response:

```
> GET /143356609602/2 HTTP/1.1
> User-Agent: curl/7.30.0
> Host: localhost:3000
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET,POST
< Access-Control-Allow-Headers: Content-Type
< Date: Sat, 06 Jun 2015 04:56:48 GMT
< Connection: keep-alive
< Transfer-Encoding: chunked
<
[
    {"key":"1433566096030","value":{"name":"Bob","age":"36"}},
    {"key":"1433566228264","value":{"name":"Bob","age":"36"}},
    {"key":"1433566228265","value":{"name":"Eugene","age":76}}
]
```

