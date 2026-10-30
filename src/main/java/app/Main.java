package app;

import app.api.RestApiServer;
import app.patterns.singleton.DatabaseManager;
import app.ui.MainFrame;

import java.awt.GraphicsEnvironment;
import java.sql.Connection;

public class Main {
    public static void main(String[] args) {
        System.out.println("Initializing HostelHub Management System...");
        
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("Database connected successfully and Schema initialized!");
            }
        } catch (Exception e) {
            System.err.println("System failed to boot: " + e.getMessage());
        }

        // Determine server port from env or default to 8080
        int port = 8080;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            try {
                port = Integer.parseInt(envPort.trim());
            } catch (Exception ignored) {}
        }

        // Start embedded REST API server
        try {
            RestApiServer restServer = new RestApiServer(port);
            restServer.start();
        } catch (Exception e) {
            System.err.println("Failed to start REST API server: " + e.getMessage());
        }

        // Check for headless or --server-only execution
        boolean serverOnly = false;
        for (String arg : args) {
            if ("--server".equalsIgnoreCase(arg) || "--no-gui".equalsIgnoreCase(arg) || "--server-only".equalsIgnoreCase(arg)) {
                serverOnly = true;
                break;
            }
        }

        if (!serverOnly && !GraphicsEnvironment.isHeadless()) {
            try {
                MainFrame.launch();
            } catch (Exception e) {
                System.out.println("GUI skipped or unavailable: " + e.getMessage());
            }
        }
    }
}
