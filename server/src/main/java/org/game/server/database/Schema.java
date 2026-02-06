package org.game.server.database;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class Schema {
    public static void create(Connection connection) throws SQLException {
        Statement statement = connection.createStatement();
        statement.execute("""
          CREATE TABLE IF NOT EXISTS sessions (
            sessionId TEXT PRIMARY KEY,
            nickname TEXT,
            startedAt INTEGER,
            finishedAt INTEGER,
            score INTEGER,
            clientVersion TEXT
          )
        """);
        statement.execute("""
          CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT,
            score INTEGER,
            whenTs INTEGER
          )
        """);
    }
}