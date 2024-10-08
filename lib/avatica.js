const axios = require('axios')
const uuid = require('uuid')

/**
 * The return value for database results.
 * @typedef ResultSet
 * @property {Array} columns - Array of column metadata describing the columns found in rows
 * @property {Array} rows - Array containing the returned data
 * @property {Number} updateCount - For standard queries this is -1, for empty sets this is 0, any other value indicates how many rows changed via statement execution.
 */
class ResultSet {
    constructor(columns, rows, updateCount) {
        this.columns = columns
        this.rows = rows
        this.updateCount = updateCount
    }

    static empty() {
        return new ResultSet([], [], 0)
    }
}

/**
 * Prepared statement parameter, use static helper methods to create appropriate parameter type
 */
class StatementParameter {
    constructor(type, value) {
        this.type = type
        this.value = value
    }

    /**
     * Create string parameter
     * @param value {string}
     * @returns {StatementParameter}
     */
    static str(value) {
        return new StatementParameter("STRING", value)
    }

    /**
     * Create char parameter
     * @param value {string}
     * @returns {StatementParameter}
     */
    static char(value) {
        return new StatementParameter("CHARACTER", value)
    }

    /**
     * Create pre-encoded byte string parameter
     * @param value {string}
     * @returns {StatementParameter}
     */
    static encoded(value) {
        return new StatementParameter("BYTE_STRING", value)
    }

    /**
     * Create null parameter
     * @returns {StatementParameter}
     */
    static null() {
        return new StatementParameter("NULL", null)
    }

    /**
     * Create primative boolean parameter
     * @param value {boolean}
     * @returns {StatementParameter}
     */
    static primativeBool(value) {
        return new StatementParameter("PRIMITIVE_BOOLEAN", value === true)
    }

    /**
     * Create boolean parameter
     * @param value {boolean}
     * @returns {StatementParameter}
     */
    static bool(value) {
        return new StatementParameter("BOOLEAN", value === true)
    }

    /**
     * Create number parameter
     * @param value {number}
     * @returns {StatementParameter}
     */
    static genericNumber(value) {
        return new StatementParameter("NUMBER", value)
    }

    /**
     * Create BigDecimal parameter
     * @param value {number}
     * @returns {StatementParameter}
     */
    static bigDecimal(value) {
        return new StatementParameter("BIG_DECIMAL", value)
    }

    /**
     * Create primative
     * @param value {number}
     * @returns {StatementParameter}
     */
    static primativeByte(value) {
        return new StatementParameter("PRIMITIVE_BYTE", value)
    }

    /**
     * Create primative
     * @param value {number}
     * @returns {StatementParameter}
     */
    static primativeShort(value) {
        return new StatementParameter("PRIMITIVE_SHORT", value)
    }

    /**
     * Create primative
     * @param value {number}
     * @returns {StatementParameter}
     */
    static primativeInt(value) {
        return new StatementParameter("PRIMITIVE_INT", value)
    }

    /**
     * Create primative
     * @param value {number}
     * @returns {StatementParameter}
     */
    static primativeLong(value) {
        return new StatementParameter("PRIMITIVE_LONG", value)
    }

    /**
     * Create primative
     * @param value {number}
     * @returns {StatementParameter}
     */
    static primativeFloat(value) {
        return new StatementParameter("PRIMITIVE_FLOAT", value)
    }

    /**
     * Create primative
     * @param value {number}
     * @returns {StatementParameter}
     */
    static primativeDouble(value) {
        return new StatementParameter("PRIMITIVE_DOUBLE", value)
    }

    /**
     * Create byte
     * @param value {number}
     * @returns {StatementParameter}
     */
    static byte(value) {
        return new StatementParameter("BYTE", value)
    }

    /**
     * Create short
     * @param value {number}
     * @returns {StatementParameter}
     */
    static short(value) {
        return new StatementParameter("SHORT", value)
    }

    /**
     * Create int
     * @param value {number}
     * @returns {StatementParameter}
     */
    static int(value) {
        return new StatementParameter("INT", value)
    }

    /**
     * Create long
     * @param value {number}
     * @returns {StatementParameter}
     */
    static long(value) {
        return new StatementParameter("LONG", value)
    }

    /**
     * Create float
     * @param value {number}
     * @returns {StatementParameter}
     */
    static float(value) {
        return new StatementParameter("FLOAT", value)
    }

    /**
     * Create double
     * @param value {number}
     * @returns {StatementParameter}
     */
    static double(value) {
        return new StatementParameter("DOUBLE", value)
    }

    /**
     * @param value As an integer, milliseconds since midnight
     * @returns {StatementParameter}
     */
    static sqlTime(value) {
        return new StatementParameter("JAVA_SQL_TIME", value)
    }

    /**
     * @param value As an integer, the number of days since the epoch.
     * @returns {StatementParameter}
     */
    static sqlDate(value) {
        return new StatementParameter("JAVA_SQL_DATE", value)
    }

    /**
     * @param value As a long, milliseconds since the epoch.
     * @returns {StatementParameter}
     */
    static sqlTimestamp(value) {
        return new StatementParameter("JAVA_SQL_TIMESTAMP", value)
    }

    /**
     * @param value As a long, milliseconds since the epoch.
     * @returns {StatementParameter}
     */
    static javaDate(value) {
        return new StatementParameter("JAVA_UTIL_DATE", value)
    }
}

class AxiosClient {
    constructor(url) {
        this._url = url
    }

    post(request) {
        return axios.post(this._url, request, {headers: {'Content-Type': 'application/json'}}).then(r => r.data)
    }
}

class AvaticaConnection {
    constructor(connectionId, client, maxFrameSize, maxRowsCount) {
        this._connectionId = connectionId
        this._client = client
        this._maxFrameSize = maxFrameSize ? maxFrameSize : 100
        this._maxRowsCount = maxRowsCount ? maxRowsCount : 9999999
        this._req = function(name,ext) {
            if (ext) {
                return {
                    request: name,
                    connectionId: this._connectionId,
                    ...ext
                }
            }
            return {
                request: name,
                connectionId: this._connectionId
            }
        }
        this._processFrame = function(statementId, offset, frame, resultSet) {
            frame.rows.forEach(r => resultSet.rows.push(r))

            if (frame.done) {
                this._client.post(this._req("closeStatement", {statementId: statementId}))
                return resultSet
            }

            offset = offset + frame.rows.length
            const fetchRequest =
                this._req("fetch", {
                    statementId: statementId,
                    offset: offset,
                    fetchMaxRowCount: this._maxFrameSize
                })

            return this._client
                .post(fetchRequest)
                .then(fetchResponse => {
                    return this._processFrame(statementId, offset, fetchResponse.frame, resultSet)
                })
        }
        this._processResult = async function (respResult) {
            if (respResult.updateCounts) {
                const batchResult = ResultSet.empty()
                batchResult["updateCounts"] = respResult.updateCounts
                return batchResult
            }

            const results = respResult.results && respResult.results.length > 0 ? respResult.results : [respResult]
            const response = []
            for (let result of results) {
                const columns = result.signature && result.signature.columns ? result.signature.columns : []
                if (result.firstFrame) {
                    const rs = await this._processFrame(result.statementId, 0, result.firstFrame, new ResultSet(columns, [], result.updateCount))
                    response.push(rs)
                } else if (result.updateCount) {
                    response.push(new ResultSet([], [], result.updateCount))
                } else {
                    response.push(ResultSet.empty())
                }
            }

            return response[0]
        }
        this._processFilter = function (name,filter) {
            const request = this._req(name)
            if (Object.hasOwn(filter, 'catalog')) {
                request['catalog'] = filter.catalog
            }
            if (Object.hasOwn(filter, 'schema')) {
                request['schemaPattern'] = filter.schema
            }
            if (Object.hasOwn(filter, 'table')) {
                request['tableNamePattern'] = filter.table
            }
            if (Object.hasOwn(filter, 'column')) {
                request['columnNamePattern'] = filter.column
            }
            return request
        }
    }

    /**
     * Queries the connection for the database information
     * @returns {PromiseLike<Object>} promimse containing a databasrProperties object
     */
    dbInfo() {
        return this._client
            .post(this._req("databaseProperties"))
            .then(response => response.map)
    }


    /**
     * List what type of tables the database supports
     * @returns {PromiseLike<ResultSet>} promimse containing a ResultSet of table types
     * */
    tableTypes() {
        return this._client
            .post(this._req("getTableTypes"))
            .then(resultSet =>  this._processResult(resultSet))
    }

    /**
     * if auto commit is not enabled for the connection, this will roll back your changes if you have not committed them yet
     * @returns {PromiseLike<ResultSet>} promimse containing a empty ResultSet
     * */
    rollback() {
        return this._client
            .post(this._req("rollback"))
            .then(r => ResultSet.empty())
    }

    /**
     * if auto commit is not enabled for the connection, this will commit
     * @returns {PromiseLike<ResultSet>} promimse containing a empty ResultSet
     * */
    commit() {
        return this._client
            .post(this._req("commit"))
            .then(r => ResultSet.empty())
    }

    /**
     * Search databse for catalogs
     * @returns {PromiseLike<ResultSet>} promimse containing a ResultSet
     */
    catelogs() {
        return this._client
            .post(this._req("getCatalogs"))
            .then(resultSet =>  this._processResult(resultSet))
    }

    /**
     * @typedef SchemaFilter
     * @property {string} catalog - Category name
     * @property {string} schema - Schema search pattern
     */

    /**
     * Search databse for schema information
     * @param filter {SchemaFilter}
     * @returns {PromiseLike<ResultSet>} promimse containing a ResultSet
     */
    schemas(filter) {
        const pf = this._processFilter("getSchemas", filter)
        if (Object.hasOwn(pf, 'columnNamePattern'))
            delete pf['columnNamePattern']
        if (Object.hasOwn(pf, 'tableNamePattern'))
            delete pf['tableNamePattern']
        return this._client
            .post(pf)
            .then(resultSet =>  this._processResult(resultSet))
    }

    /**
     * @typedef TableFilter
     * @property {string} catalog - Category name
     * @property {string} schema - Schema search pattern
     * @property {string} table - Table search pattern
     */

    /**
     * Search databse for table information
     * @param filter {TableFilter}
     * @returns {PromiseLike<ResultSet>} promimse containing a ResultSet
     */
    tables(filter) {
        const pf = this._processFilter("getTables", filter)
        if (Object.hasOwn(pf, 'columnNamePattern'))
            delete pf['columnNamePattern']
        return this._client
            .post(pf)
            .then(resultSet =>  this._processResult(resultSet))
    }

    /**
     * @typedef ColumnFilter
     * @property {string} catalog - Category name
     * @property {string} schema - Schema search pattern
     * @property {string} table - Table search pattern
     * @property {string} column - Column search pattern
     */

    /**
     * Search databse for column information
     * @param filter {ColumnFilter}
     * @returns {PromiseLike<ResultSet>} promimse containing a ResultSet
     */
    columns(filter) {
        return this._client
            .post(this._processFilter("getColumns", filter))
            .then(resultSet =>  this._processResult(resultSet))
    }

    /**
     * Close this connection.
     *
     * Should be called on a connection once it is no longer needed.
     */
    close() {
        return this._client.post(this._req("closeConnection"))
    }

    /**
     * Execute a batch of sql statements. Only update operations are supported.
     * @param sqls {Array.<string> | string} The first parameter can be an array of statements, or you can use the spread to submit multiple statements
     * @returns {PromiseLike<ResultSet>} promimse containing empty ResultSet, with new updateCounts array containing counts for each statement
     */
    batch(...sqls) {
        const stmts = Array.isArray(sqls[0]) ? sqls[0] : sqls
        return this._client
            .post(this._req("createStatement"))
            .then(createStatementResponse => {
                const prepareBatchRequest =
                    this._req("prepareAndExecuteBatch", {
                        statementId: createStatementResponse.statementId,
                        sqlCommands: stmts
                    })
                return this._client
                    .post(prepareBatchRequest)
                    .then(prepareAndExecuteResponse => this._processResult(prepareAndExecuteResponse))
        })
    }

    /**
     * Creates and executes a prepared statement
     * @param sql statement to be executed
     * @param parameters {Array.<StatementParameter> | StatementParameter} The first parameter can be an array of statement parameters, or you can use the spread to submit multiple parameters
     * @returns {PromiseLike<ResultSet>} promimse containing the ResultSet from the statement
     */
    execute(sql, ...parameters) {
        const pValues = Array.isArray(parameters[0]) ? parameters[0] : parameters;
        const prepareRequest =
            this._req("prepare", {
                sql: sql,
                maxRowCount: this._maxRowsCount
            })
        return this._client
            .post(prepareRequest)
            .then(prepareResponse => {
                // this request does not include connectionId as statementHandle has this already
                const executeRequest = {
                    request: "execute",
                    statementHandle: prepareResponse.statement,
                    parameterValues: pValues,
                    maxRowCount: this._maxRowsCount
                }
                return this._client.post(executeRequest).then(executeResponse => this._processResult(executeResponse))
            })
    }


    /**
     * Execute a SQL query.
     *
     * Returns a Promise to the ResultSet containing the results of the query.
     *
     * @param sql query to be executed
     * @returns {PromiseLike<ResultSet>} promimse containing the ResultSet from the query
     */
    query(sql) {
        return this._client
            .post(this._req("createStatement"))
            .then(createStatementResponse => {
                const prepareAndExecuteRequest =
                    this._req("prepareAndExecute", {
                        statementId: createStatementResponse.statementId,
                        sql: sql,
                        maxRowsInFirstFrame: this._maxFrameSize,
                        maxRowCount: this._maxRowsCount
                    })
                return this._client
                    .post(prepareAndExecuteRequest)
                    .then(prepareAndExecuteResponse => this._processResult(prepareAndExecuteResponse))
        })
    }

}

/**
 * The main factory for the Connection object.
 *
 * The Connection object returned in the promise should be closed after it is no longer needed.
 *
 * @param url url of the Avatica server to connect to
 * @param user user name for connecting to Avatica
 * @param pass user password for connecting to Avatica
 */
class ConnectionFactory {
    constructor(url,user,pass) {
        this._client = new AxiosClient(url)
        this._user = user
        this._pass = pass
        this.hostname = "js-client"
        this.maxFrameSize = 100
        this.maxRowsCount = 9999999
    }

    /**
     * Create a promise of Connection object.
     *
     * The Connection object returned in the promise should be closed after it is no longer needed.
     *
     * @returns {Promise<AvaticaConnection | never>} a promise to a Connection object which allows querying
     */
    connect() {
        const connectionId = `${uuid.v1()}@${this.hostname}`
        const openConnectionPayload = {
            request: "openConnection",
            connectionId: connectionId,
            info: {
                user: this._user,
                password: this._pass
            }
        }

        return this._client
            .post(openConnectionPayload)
            .then(r => new AvaticaConnection(connectionId,this._client,this.maxFrameSize,this.maxRowsCount))
    }
}

module.exports = {ConnectionFactory,StatementParameter}
