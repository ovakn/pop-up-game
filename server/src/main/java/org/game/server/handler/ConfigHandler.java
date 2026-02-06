package org.game.server.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.FullHttpRequest;
import org.game.server.http.JsonUtil;
import java.util.Map;

public class ConfigHandler {
    public static void handle(ChannelHandlerContext channelHandlerContext, FullHttpRequest request) {
        JsonUtil.send(channelHandlerContext, Map.of(
                "spawnRatePerSec", 1.8,
                "badBallChance", 0.15,
                "bonusBallChance", 0.10,
                "maxLives", 3,
                "bonusDurations", Map.of(
                        "doublePoints", 10,
                        "slowTime", 5,
                        "shield", 0
                ),
                "scores", Map.of(
                        "normal", 1,
                        "bombAll", 1
                )
        ));
    }
}