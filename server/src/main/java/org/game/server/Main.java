package org.game.server;

import org.game.server.database.Database;
import org.game.server.http.HttpServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {
    private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) throws Exception {
        Database.init();
        HttpServer.start(8080);
        LOGGER.info("Server works");
    }
}