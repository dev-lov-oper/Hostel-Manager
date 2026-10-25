package app.ui.dean;

import app.model.User;
import app.ui.components.StatCardPanel;

import javax.swing.*;
import java.awt.*;

public class DeanDashboardPanel extends JPanel {

    public DeanDashboardPanel(User user) {
        setLayout(new BorderLayout(15, 15));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("Dean High-Level Oversight Panel");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        add(title, BorderLayout.NORTH);

        JPanel stats = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 0));
        stats.add(new StatCardPanel("Critical Cases", "1", new Color(220, 53, 69)));
        stats.add(new StatCardPanel("Resolution Rate", "94%", new Color(46, 139, 87)));
        stats.add(new StatCardPanel("Total Students", "350", new Color(0, 123, 255)));
        
        add(stats, BorderLayout.CENTER);
    }
}