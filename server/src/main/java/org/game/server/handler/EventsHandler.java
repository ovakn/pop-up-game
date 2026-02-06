package org.game.server.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.FullHttpRequest;
import org.game.server.http.JsonUtil;
import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class EventsHandler {
    public static void handle(ChannelHandlerContext channelHandlerContext, FullHttpRequest request) throws Exception {
        Map body = JsonUtil.parse(request.content());
        List<?> events = (List<?>) body.get("events");
        if (events.size() > 500) {
            JsonUtil.send(channelHandlerContext, Map.of("ok", false));
            return;
        }
        String file = "logs/events-" + LocalDate.now() + ".ndjson";
        Files.createDirectories(Path.of("logs"));
        try (BufferedWriter w = Files.newBufferedWriter(
                Path.of(file),
                StandardOpenOption.CREATE,
                StandardOpenOption.APPEND)) {
            for (Object e : events) {
                w.write(JsonUtil.stringify(e));
                w.newLine();
            }
        }
        JsonUtil.send(channelHandlerContext, Map.of("ok", true));
    }
}