package app.ui.student;

import app.model.User;
import app.ui.components.StatCardPanel;

import javax.swing.*;
import java.awt.*;

public class StudentDashboardPanel extends JPanel {

    public StudentDashboardPanel(User user) {
        setLayout(new BorderLayout(10, 10));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Header Title
        JLabel welcomeLabel = new JLabel("Welcome back, " + user.getFullName() + "!");
        welcomeLabel.setFont(new Font("SansSerif", Font.BOLD, 20));
        add(welcomeLabel, BorderLayout.NORTH);

        // Stats Row
        JPanel statsPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 0));
        statsPanel.add(new StatCardPanel("Room Status", "Allocated", new Color(46, 139, 87)));
        statsPanel.add(new StatCardPanel("Active Complaints", "1 Pending", new Color(220, 53, 69)));
        statsPanel.add(new StatCardPanel("Notifications", "2 Unread", new Color(0, 123, 255)));
        add(statsPanel, BorderLayout.CENTER);
    }
}