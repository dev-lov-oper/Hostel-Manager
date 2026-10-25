package app.ui.components;

import app.model.User;
import javax.swing.*;
import java.awt.*;
import java.util.function.Consumer;

public class SidebarPanel extends JPanel {

    public SidebarPanel(User user, Consumer<String> onNavigate, Runnable onLogout) {
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setBackground(new Color(40, 45, 60));
        setPreferredSize(new Dimension(200, 0));
        setBorder(BorderFactory.createEmptyBorder(20, 10, 20, 10));

        JLabel titleLabel = new JLabel("HMS Portal");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 18));
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        add(titleLabel);

        add(Box.createRigidArea(new Dimension(0, 5)));

        JLabel roleLabel = new JLabel("(" + user.getRole().name() + ")");
        roleLabel.setForeground(new Color(180, 190, 210));
        roleLabel.setFont(new Font("SansSerif", Font.ITALIC, 12));
        roleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        add(roleLabel);

        add(Box.createRigidArea(new Dimension(0, 25)));

        // Role Navigation Routing
        addNavButton("Dashboard", onNavigate);
        if (user.getRole() == app.model.Role.ADMIN) {
            addNavButton("Room Templates", onNavigate);
            addNavButton("User Management", onNavigate);
        } else if (user.getRole() == app.model.Role.STUDENT) {
            addNavButton("Room Request", onNavigate);
            addNavButton("My Complaints", onNavigate);
        } else if (user.getRole() == app.model.Role.WARDEN || user.getRole() == app.model.Role.CHIEF_WARDEN) {
            addNavButton("Allocations", onNavigate);
            addNavButton("Complaints", onNavigate);
        }

        add(Box.createVerticalGlue());

        JButton logoutBtn = new JButton("Logout");
        logoutBtn.setMaximumSize(new Dimension(180, 35));
        logoutBtn.setAlignmentX(Component.CENTER_ALIGNMENT);
        logoutBtn.addActionListener(e -> onLogout.run());
        add(logoutBtn);
    }

    private void addNavButton(String label, Consumer<String> onNavigate) {
        JButton btn = new JButton(label);
        btn.setMaximumSize(new Dimension(180, 35));
        btn.setAlignmentX(Component.CENTER_ALIGNMENT);
        btn.addActionListener(e -> onNavigate.accept(label));
        add(btn);
        add(Box.createRigidArea(new Dimension(0, 10)));
    }
}