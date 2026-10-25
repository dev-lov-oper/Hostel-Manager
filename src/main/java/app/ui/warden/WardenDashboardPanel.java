package app.ui.warden;

import app.model.User;
import app.ui.components.StatCardPanel;

import javax.swing.*;
import java.awt.*;

public class WardenDashboardPanel extends JPanel {

    public WardenDashboardPanel(User user) {
        setLayout(new BorderLayout(10, 10));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("Warden Operational Control");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        add(title, BorderLayout.NORTH);

        JPanel stats = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 0));
        stats.add(new StatCardPanel("Pending Requests", "5", new Color(255, 193, 7)));
        stats.add(new StatCardPanel("Open Complaints", "8", new Color(220, 53, 69)));
        stats.add(new StatCardPanel("Occupied Beds", "142 / 150", new Color(46, 139, 87)));
        add(stats, BorderLayout.CENTER);
    }
}