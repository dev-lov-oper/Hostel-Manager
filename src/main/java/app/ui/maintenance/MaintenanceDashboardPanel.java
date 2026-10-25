package app.ui.maintenance;

import app.model.User;
import app.ui.components.StatCardPanel;

import javax.swing.*;
import java.awt.*;

public class MaintenanceDashboardPanel extends JPanel {

    public MaintenanceDashboardPanel(User user) {
        setLayout(new BorderLayout(15, 15));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("Maintenance Staff Work Center");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        add(title, BorderLayout.NORTH);

        JPanel stats = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 0));
        stats.add(new StatCardPanel("Assigned Tasks", "4", new Color(255, 193, 7)));
        stats.add(new StatCardPanel("In Progress", "2", new Color(0, 123, 255)));
        stats.add(new StatCardPanel("Completed Today", "5", new Color(46, 139, 87)));

        add(stats, BorderLayout.CENTER);
    }
}