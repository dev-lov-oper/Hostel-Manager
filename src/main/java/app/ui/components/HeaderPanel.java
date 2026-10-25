package app.ui.components;

import app.model.User;

import javax.swing.*;
import java.awt.*;

public class HeaderPanel extends JPanel {

    public HeaderPanel(User user, String pageTitle) {
        setLayout(new BorderLayout());
        setBackground(new Color(245, 247, 250));
        setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(0, 0, 1, 0, new Color(220, 224, 230)),
                BorderFactory.createEmptyBorder(15, 20, 15, 20)
        ));

        // Left Section: Page / Section Title
        JLabel titleLabel = new JLabel(pageTitle);
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 20));
        titleLabel.setForeground(new Color(30, 40, 55));
        add(titleLabel, BorderLayout.WEST);

        // Right Section: User Info Card & Role Badge
        JPanel rightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 15, 0));
        rightPanel.setOpaque(false);

        JLabel userLabel = new JLabel(user.getFullName() + " (" + user.getUsername() + ")");
        userLabel.setFont(new Font("SansSerif", Font.PLAIN, 14));
        userLabel.setForeground(new Color(70, 80, 95));

        JLabel roleBadge = new JLabel(" " + user.getRole().name() + " ");
        roleBadge.setFont(new Font("SansSerif", Font.BOLD, 11));
        roleBadge.setOpaque(true);
        roleBadge.setBackground(new Color(0, 123, 255));
        roleBadge.setForeground(Color.WHITE);
        roleBadge.setBorder(BorderFactory.createEmptyBorder(4, 8, 4, 8));

        rightPanel.add(userLabel);
        rightPanel.add(roleBadge);

        add(rightPanel, BorderLayout.EAST);
    }
}