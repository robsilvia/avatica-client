# Avatica Javascript Client
JavaScript connector to [Calcite Avatica Server](https://calcite.apache.org/avatica/)

Missing Avatica API Features:
- There is no support for array/component columns or parameters
- There is no support for batch processing (Multistatement submission)
- There is no way to configure frame batch sizes, or max rows count

### Example
```
const {StatementParameter,ConnectionFactory} = require('avatica-client');

const factory = new ConnectionFactory('https://avatica-host/', "user", "pass")

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

        dbInfo()
            .then(listTableTypes)
            .then(listCatalogs)
            .then(listSchemas)
            .then(listTables)
            .then(listColumns)
            .then(query)
            .then(execute)
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
