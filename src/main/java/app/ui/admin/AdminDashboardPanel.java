package app.ui.admin;

import app.model.User;
import app.ui.components.StatCardPanel;

import javax.swing.*;
import java.awt.*;

public class AdminDashboardPanel extends JPanel {

    public AdminDashboardPanel(User user) {
        setLayout(new BorderLayout(15, 15));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Title Header
        JLabel title = new JLabel("System Administrator Dashboard");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        add(title, BorderLayout.NORTH);

        // Stats Cards Row
        JPanel statsPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 0));
        statsPanel.add(new StatCardPanel("Total Users", "12", new Color(0, 123, 255)));
        statsPanel.add(new StatCardPanel("Hostel Blocks", "4", new Color(46, 139, 87)));
        statsPanel.add(new StatCardPanel("Room Templates", "6", new Color(111, 66, 193)));
        statsPanel.add(new StatCardPanel("System Logs", "Active", new Color(255, 193, 7)));

        // Management Summary Table / Mock Panel
        JPanel centerPanel = new JPanel(new BorderLayout());
        centerPanel.setBorder(BorderFactory.createTitledBorder("System Overview & Quick Configuration"));

        String[] columns = {"Setting / Resource", "Status", "Last Modified"};
        Object[][] data = {
            {"Database Persistence Engine", "CONNECTED (SQLite)", "Just now"},
            {"Role-Based Access Control", "ACTIVE", "Today"},
            {"Prototype Template Registry", "INITIALIZED", "Today"},
            {"BCrypt Password Hashing", "ENFORCED", "Today"}
        };

        JTable summaryTable = new JTable(data, columns);
        centerPanel.add(new JScrollPane(summaryTable), BorderLayout.CENTER);

        JPanel mainContent = new JPanel(new BorderLayout(10, 10));
        mainContent.add(statsPanel, BorderLayout.NORTH);
        mainContent.add(centerPanel, BorderLayout.CENTER);

        add(mainContent, BorderLayout.CENTER);
    }
}