package org.apache.calcite.avatica.js;

public class SQLiteMetaFactory extends JdbcMetaFactory {
    public SQLiteMetaFactory() {
        super("jdbc:sqlite:test.db");
    }
}
