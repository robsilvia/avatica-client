package org.apache.calcite.avatica.js;

import org.apache.calcite.avatica.Meta;
import org.apache.calcite.avatica.jdbc.JdbcMeta;

import java.sql.SQLException;
import java.util.List;

public class JdbcMetaFactory implements Meta.Factory {
    protected String jdbcUrl;

    public JdbcMetaFactory() {}

    public JdbcMetaFactory(String jdbcUrl) {
        this.jdbcUrl = jdbcUrl;
    }

    protected Meta create() {
        try {
            return new JdbcMeta(jdbcUrl);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Meta create(List<String> args) {
        return create();
    }
}
