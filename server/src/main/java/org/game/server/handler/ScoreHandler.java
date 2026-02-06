package org.game.server.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.FullHttpRequest;
import org.game.server.database.Database;
import org.game.server.http.JsonUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;

public class ScoreHandler {
    public static void handle(ChannelHandlerContext channelHandlerContext, FullHttpRequest request) throws Exception {
        Map body = JsonUtil.parse(request.content());
        String sessionId = (String) body.get("sessionId");
        int score = (int) body.get("score");
        long now = System.currentTimeMillis() / 1000;
        Connection connection = Database.getConnection();
        PreparedStatement upd = connection.prepareStatement(
                "UPDATE sessions SET finishedAt=?, score=? WHERE sessionId=?"
        );
        upd.setLong(1, now);
        upd.setInt(2, score);
        upd.setString(3, sessionId);
        upd.execute();
        PreparedStatement ins = connection.prepareStatement(
                "INSERT INTO scores(nickname, score, whenTs) " +
                        "SELECT nickname, ?, ? FROM sessions WHERE sessionId=?"
        );
        ins.setInt(1, score);
        ins.setLong(2, now);
        ins.setString(3, sessionId);
        ins.execute();
        PreparedStatement rankQ = connection.prepareStatement(
                "SELECT COUNT(*)+1 FROM scores WHERE score > ?"
        );
        rankQ.setInt(1, score);
        ResultSet r1 = rankQ.executeQuery();
        int rank = r1.getInt(1);
        PreparedStatement bestQ = connection.prepareStatement(
                "SELECT MAX(score) FROM scores WHERE nickname = " +
                        "(SELECT nickname FROM sessions WHERE sessionId=?)"
        );
        bestQ.setString(1, sessionId);
        ResultSet r2 = bestQ.executeQuery();
        int best = r2.getInt(1);
        JsonUtil.send(channelHandlerContext, Map.of(
                "rank", rank,
                "best", best
        ));
    }
}