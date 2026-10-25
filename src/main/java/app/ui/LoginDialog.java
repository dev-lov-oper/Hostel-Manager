package app.ui;

import app.model.User;
import app.service.AuthService;
import javax.swing.*;
import java.awt.*;

public class LoginDialog extends JDialog {

    private final JTextField usernameField = new JTextField(15);
    private final JPasswordField passwordField = new JPasswordField(15);
    private final AuthService authService = new AuthService();
    private User authenticatedUser = null;

    public LoginDialog(Frame owner) {
        super(owner, "Hostel Management System — Login", true);
        setLayout(new GridBagLayout());
        setSize(360, 240);
        setLocationRelativeTo(owner);
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 8, 8, 8);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        gbc.gridx = 0; gbc.gridy = 0;
        add(new JLabel("Username:"), gbc);
        gbc.gridx = 1;
        add(usernameField, gbc);

        gbc.gridx = 0; gbc.gridy = 1;
        add(new JLabel("Password:"), gbc);
        gbc.gridx = 1;
        add(passwordField, gbc);

        JButton loginBtn = new JButton("Login");
        gbc.gridx = 0; gbc.gridy = 2; gbc.gridwidth = 2;
        add(loginBtn, gbc);

        loginBtn.addActionListener(e -> {
            String username = usernameField.getText().trim();
            String password = new String(passwordField.getPassword());
            
            User user = authService.authenticate(username, password);
            if (user != null) {
                authenticatedUser = user;
                dispose();
            } else {
                JOptionPane.showMessageDialog(this, "Invalid credentials.", "Login Error", JOptionPane.ERROR_MESSAGE);
            }
        });
    }

    public User getAuthenticatedUser() {
        return authenticatedUser;
    }
}