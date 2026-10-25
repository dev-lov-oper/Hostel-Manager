package app;

import app.patterns.singleton.DatabaseManager;
import app.ui.MainFrame;

import java.sql.Connection;

public class Main {
    public static void main(String[] args) {
        System.out.println("Initializing Hostel Management System...");
        
        try (Connection conn = DatabaseManager.getInstance().getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("Database connected successfully and Schema initialized!");
            }
        } catch (Exception e) {
            System.err.println("System failed to boot: " + e.getMessage());
        }

        MainFrame.launch();
    }
}