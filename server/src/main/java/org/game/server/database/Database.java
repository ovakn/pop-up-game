package org.game.server.database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Database {
    private static final Logger LOGGER = LoggerFactory.getLogger(Database.class);
    private static Connection connection;

    public static void init() throws SQLException {
        connection = DriverManager.getConnection("jdbc:sqlite:game.db");
        Schema.create(connection);
        LOGGER.info("Database is created");
    }

    public static Connection getConnection() {
        return connection;
    }
}