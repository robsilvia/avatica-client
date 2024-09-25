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

        // This will result in an error, it appears to be an issue with SQLite Release 3.46.1.0 (I have not tried other versions)
        // The following code will raise an exception using SQLite, but not when using MS-SQL (I would need to test more drivers)
        // -------------------------------------------------------------------------------------------------------------
        // Connection connection = DriverManager.getConnection("jdbc:sqlite:test.db");
        // PreparedStatement statement = connection.prepareStatement("select * from test where name = ?");
        // System.out.println(statement.getParameterMetaData().getParameterType(1));
        // connection.close();
        // -------------------------------------------------------------------------------------------------------------
        function executeTestTable() {
            return conn.execute("select * from test where name = ?", [StatementParameter.str("Test Name")]).then(printResults)
        }

        // feature not supported on SQLite
        function batchInsertTestTable() {
            const sqls = [
                "INSERT INTO test (id,name,money) values (2,'Test Name',-1.01)"
                , "INSERT INTO test (id,name,money) values (3,'Test Name',-1.01)"
            ]

            return conn.batch(sqls).then(printResults)
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
