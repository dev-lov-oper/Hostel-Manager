package app.ui.chiefwarden;

import app.model.User;
import app.ui.components.StatCardPanel;

import javax.swing.*;
import java.awt.*;

public class ChiefWardenDashboardPanel extends JPanel {

    public ChiefWardenDashboardPanel(User user) {
        setLayout(new BorderLayout(15, 15));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("Chief Warden Executive Control");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        add(title, BorderLayout.NORTH);

        JPanel stats = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 0));
        stats.add(new StatCardPanel("Escalated Issues", "3", new Color(220, 53, 69)));
        stats.add(new StatCardPanel("Pending Reassignments", "2", new Color(255, 193, 7)));
        stats.add(new StatCardPanel("Active Wardens", "4", new Color(0, 123, 255)));
        
        add(stats, BorderLayout.CENTER);
    }
}