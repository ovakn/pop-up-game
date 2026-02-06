package org.game.server.http;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.*;
import tools.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class JsonUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static Map parse(ByteBuf buf){
        byte[] bytes = new byte[buf.readableBytes()];
        buf.readBytes(bytes);
        return mapper.readValue(bytes, Map.class);
    }

    public static String stringify(Object obj) {
        return mapper.writeValueAsString(obj);
    }

    public static void send(ChannelHandlerContext channelHandlerContext, Object obj) {
        try {
            String json = mapper.writeValueAsString(obj);
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            FullHttpResponse response =
                    new DefaultFullHttpResponse(
                            HttpVersion.HTTP_1_1,
                            HttpResponseStatus.OK,
                            Unpooled.wrappedBuffer(bytes)
                    );
            response.headers().set(HttpHeaderNames.CONTENT_TYPE, "application/json");
            response.headers().set(HttpHeaderNames.CONTENT_LENGTH, bytes.length);
            channelHandlerContext.writeAndFlush(response);

        } catch (Exception e) {
            FullHttpResponse err =
                    new DefaultFullHttpResponse(
                            HttpVersion.HTTP_1_1,
                            HttpResponseStatus.INTERNAL_SERVER_ERROR
                    );
            channelHandlerContext.writeAndFlush(err);
        }
    }

    public static void send(
            ChannelHandlerContext ctx,
            HttpResponseStatus status,
            Object obj
    ) {
        try {
            String json = mapper.writeValueAsString(obj);
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            FullHttpResponse response =
                    new DefaultFullHttpResponse(
                            HttpVersion.HTTP_1_1,
                            status,
                            Unpooled.wrappedBuffer(bytes)
                    );
            response.headers().set(HttpHeaderNames.CONTENT_TYPE, "application/json");
            response.headers().set(HttpHeaderNames.CONTENT_LENGTH, bytes.length);
            ctx.writeAndFlush(response);
        } catch (Exception e) {
            ctx.close();
        }
    }
}