package app.api.sse;

import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Server-Sent Events (SSE) Broadcaster for real-time updates.
 */
public class SseBroadcaster {

    private static final SseBroadcaster INSTANCE = new SseBroadcaster();
    private final List<HttpExchange> clients = new CopyOnWriteArrayList<>();

    private SseBroadcaster() {}

    public static SseBroadcaster getInstance() {
        return INSTANCE;
    }

    public synchronized void registerClient(HttpExchange exchange) {
        try {
            exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
            exchange.getResponseHeaders().set("Cache-Control", "no-cache");
            exchange.getResponseHeaders().set("Connection", "keep-alive");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, 0);

            OutputStream os = exchange.getResponseBody();
            String initialMessage = "data: {\"event\":\"CONNECTED\",\"message\":\"HostelHub Real-time Stream Connected\"}\n\n";
            os.write(initialMessage.getBytes(StandardCharsets.UTF_8));
            os.flush();

            clients.add(exchange);
            System.out.println("SSE Client registered. Total active: " + clients.size());
        } catch (IOException e) {
            System.err.println("Failed to register SSE client: " + e.getMessage());
        }
    }

    public void broadcast(String eventType, String jsonPayload) {
        String sseData = "event: " + eventType + "\ndata: " + jsonPayload + "\n\n";
        byte[] bytes = sseData.getBytes(StandardCharsets.UTF_8);

        List<HttpExchange> disconnected = new CopyOnWriteArrayList<>();

        for (HttpExchange client : clients) {
            try {
                OutputStream os = client.getResponseBody();
                os.write(bytes);
                os.flush();
            } catch (Exception e) {
                disconnected.add(client);
            }
        }

        if (!disconnected.isEmpty()) {
            clients.removeAll(disconnected);
            System.out.println("Cleaned up " + disconnected.size() + " disconnected SSE clients. Active: " + clients.size());
        }
    }
}

