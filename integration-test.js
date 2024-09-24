const {StatementParameter,ConnectionFactory} = require("./index");

const factory = new ConnectionFactory('http://localhost:8080/')

factory.connect()
    .then(conn => {
        function printResults(resultSet) {
            console.dir(resultSet, { depth: null })
        }

        function createTestTable() {
            return conn.query("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY,name TEXT NOT NULL,money REAL NOT NULL)").then(printResults)
        }

        function clearTestTable() {
            return conn.query("DELETE FROM test").then(printResults)
        }

        function insertIntoTestTable() {
            return conn.query("INSERT INTO test (id,name,money) values (1,'Test Name',-1.01)").then(printResults)
        }

        function selectTestTable() {
            return conn.query("select * from test").then(printResults)
        }

        createTestTable()
            .then(clearTestTable)
            .then(insertIntoTestTable)
            .then(selectTestTable)
            .then(() => conn.close())
            .catch(err => {
                conn.close()
                throw err
            })
    })
    .catch(err => {
        console.log("Got error: ", err)
    })
