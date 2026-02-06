package org.game.server.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.FullHttpRequest;
import org.game.server.database.Database;
import org.game.server.http.JsonUtil;
import java.sql.PreparedStatement;
import java.util.Map;
import java.util.UUID;

public class SessionHandler {
    public static void handle(ChannelHandlerContext channelHandlerContext, FullHttpRequest request) throws Exception {
        Map body = JsonUtil.parse(request.content());
        String nickname = (String) body.get("nickname");
        String version = (String) body.get("clientVersion");
        String sessionId = UUID.randomUUID().toString();
        long now = System.currentTimeMillis() / 1000;
        PreparedStatement ps = Database.getConnection().prepareStatement(
                "INSERT INTO sessions VALUES (?, ?, ?, NULL, 0, ?)"
        );
        ps.setString(1, sessionId);
        ps.setString(2, nickname);
        ps.setLong(3, now);
        ps.setString(4, version);
        ps.execute();
        JsonUtil.send(channelHandlerContext, Map.of(
                "sessionId", sessionId,
                "serverTime", now
        ));
    }
}