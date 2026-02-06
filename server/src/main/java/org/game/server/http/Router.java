package org.game.server.http;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.game.server.handler.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Router extends SimpleChannelInboundHandler<FullHttpRequest> {
    private static final Logger LOGGER = LoggerFactory.getLogger(Router.class);

    @Override
    protected void channelRead0(ChannelHandlerContext channelHandlerContext, FullHttpRequest request) throws Exception {
        String path = request.uri();
        HttpMethod method = request.method();
        long start = System.currentTimeMillis();
        HttpResponseStatus status = HttpResponseStatus.OK;
        try {
            if (method.equals(HttpMethod.POST) && path.equals("/session")) {
                SessionHandler.handle(channelHandlerContext, request);
            } else if (method.equals(HttpMethod.GET) && path.equals("/config")) {
                ConfigHandler.handle(channelHandlerContext, request);
            } else if (method.equals(HttpMethod.POST) && path.equals("/events")) {
                EventsHandler.handle(channelHandlerContext, request);
            } else if (method.equals(HttpMethod.POST) && path.equals("/score")) {
                ScoreHandler.handle(channelHandlerContext, request);
            } else if (method.equals(HttpMethod.GET) && path.startsWith("/leaderboard")) {
                LeaderboardHandler.handle(channelHandlerContext, request);
            } else {
                JsonUtil.send(channelHandlerContext, HttpResponseStatus.NOT_FOUND, "{\"error\":\"not found\"}");
                status = HttpResponseStatus.NOT_FOUND;
            }
        } finally {
            long ms = System.currentTimeMillis() - start;
            LOGGER.info(method + path + status + ms + "ms");
        }
    }
}