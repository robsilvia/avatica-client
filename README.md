# Avatica Javascript Client
JavaScript connector to [Calcite Avatica Server](https://calcite.apache.org/avatica/)

### Documentation - Example
```javascript
const {StatementParameter,ConnectionFactory} = require('avatica-client');

const factory = new ConnectionFactory('https://avatica-host/', "user", "pass")

// Hostname used in connection id, default js-client
factory.hostname = "js-client"
// Frame size for retrieving results, default 100 (1000 records == 10 frame requests)
factory.maxFrameSize = 100
// Maximum amount of rows any single result set can contain, default 9999999
factory.maxRowsCount = 9999999

factory.connect()
    .then(conn => {
        function printResults(resultSet) {
            console.dir(resultSet, { depth: null })
        }

        function dbInfo() {
            return conn.dbInfo().then(printResults)
        }

        function listTableTypes() {
            return conn.tableTypes().then(printResults)
        }

        function listCatalogs() {
            return conn.catelogs().then(printResults)
        }

        function listSchemas() {
            return conn.schemas({catalog: "test"}).then(printResults)
        }

        function listTables() {
            return conn.tables({catalog: "testdb", schema: "test"}).then(printResults)
        }

        function listColumns() {
            return conn.columns({catalog: "testdb", schema: "test", table: "user"}).then(printResults)
        }

        function query() {
            return conn.query("select * from testdb.test.user").then(printResults)
        }

        function execute() {
            return conn.execute("select * from testdb.test.user where user_id = ?" , [StatementParameter.str("REID")]).then(printResults)
        }

        function batch() {
            const sqls = [
                "DELETE FROM testdb.test.label WHERE user_id in (1,2)"
                , "INSERT INTO testdb.test.label (id,name) values (1,'label1')"
                , "INSERT INTO testdb.test.label (id,name) values (2,'label2')"
            ]
            return conn.batch(sqls).then(printResults)
        }

        dbInfo()
            .then(listTableTypes)
            .then(listCatalogs)
            .then(listSchemas)
            .then(listTables)
            .then(listColumns)
            .then(query)
            .then(execute)
            .then(batch)
            .then(() => conn.close())
            .catch(err => {
                conn.close()
                throw err
            })
    })
    .catch(err => {
        console.log("Got error: ", err)
    })
```

#### Notes

While it is possible to send array parameters using the following syntax.

```javascript
const arParam = {type: "ARRAY", value: ["VAL1","VAL2"], componentType: "STRING"}
```

I have yet to successfully have this execute by Avatica on the databases I have tested.
