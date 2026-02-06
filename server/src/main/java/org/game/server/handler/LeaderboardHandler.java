package org.game.server.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.QueryStringDecoder;
import org.game.server.database.Database;
import org.game.server.http.JsonUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class LeaderboardHandler {
    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 100;

    public static void handle(ChannelHandlerContext channelHandlerContext, FullHttpRequest request) throws Exception {
        QueryStringDecoder decoder = new QueryStringDecoder(request.uri());
        Map<String, List<String>> params = decoder.parameters();
        int limit = DEFAULT_LIMIT;
        if (params.containsKey("limit")) {
            try {
                limit = Integer.parseInt(params.get("limit").getFirst());
            } catch (NumberFormatException exception) {
            }
        }
        if (limit <= 0) limit = DEFAULT_LIMIT;
        if (limit > MAX_LIMIT) limit = MAX_LIMIT;
        Connection connection = Database.getConnection();
        PreparedStatement ps = connection.prepareStatement(
                "SELECT nickname, score, whenTs " +
                        "FROM scores " +
                        "ORDER BY score DESC " +
                        "LIMIT ?"
        );
        ps.setInt(1, limit);
        ResultSet rs = ps.executeQuery();
        List<Map<String, Object>> items = new ArrayList<>();
        while (rs.next()) {
            items.add(Map.of(
                    "nickname", rs.getString("nickname"),
                    "score", rs.getInt("score"),
                    "when", rs.getLong("whenTs")
            ));
        }
        JsonUtil.send(channelHandlerContext, Map.of("items", items));
    }
}