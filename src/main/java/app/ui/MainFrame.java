package app.ui;

import app.model.User;
import app.service.AuthService;
import app.ui.admin.AdminDashboardPanel;
import app.ui.admin.RoomTemplatePanel;
import app.ui.admin.UserManagementPanel;
import app.ui.chiefwarden.ChiefWardenDashboardPanel;
import app.ui.components.SidebarPanel;
import app.ui.dean.DeanDashboardPanel;
import app.ui.maintenance.MaintenanceDashboardPanel;
import app.ui.student.StudentDashboardPanel;
import app.ui.warden.WardenDashboardPanel;

import javax.swing.*;
import java.awt.*;

public class MainFrame extends JFrame {

    private final CardLayout cardLayout = new CardLayout();
    private final JPanel cardsPanel = new JPanel(cardLayout);

    public MainFrame(User user) {
        setTitle("Hostel Management System — [" + user.getFullName() + "]");
        setSize(1024, 680);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Setup Card Views
        cardsPanel.add(new AdminDashboardPanel(user), "Dashboard");
        if (user.getRole() == app.model.Role.ADMIN) {
            cardsPanel.add(new RoomTemplatePanel(), "Room Templates");
            cardsPanel.add(new UserManagementPanel(), "User Management");
        } else if (user.getRole() == app.model.Role.STUDENT) {
            cardsPanel.add(new StudentDashboardPanel(user), "Dashboard");
        } else if (user.getRole() == app.model.Role.WARDEN) {
            cardsPanel.add(new WardenDashboardPanel(user), "Dashboard");
        } else if (user.getRole() == app.model.Role.CHIEF_WARDEN) {
            cardsPanel.add(new ChiefWardenDashboardPanel(user), "Dashboard");
        } else if (user.getRole() == app.model.Role.DEAN) {
            cardsPanel.add(new DeanDashboardPanel(user), "Dashboard");
        } else if (user.getRole() == app.model.Role.MAINTENANCE) {
            cardsPanel.add(new MaintenanceDashboardPanel(user), "Dashboard");
        }

        // Sidebar Navigation Callback Handler
        SidebarPanel sidebar = new SidebarPanel(user, this::navigateTo, this::logout);
        add(sidebar, BorderLayout.WEST);
        add(cardsPanel, BorderLayout.CENTER);
    }

    private void navigateTo(String cardName) {
        cardLayout.show(cardsPanel, cardName);
    }

    private void logout() {
        AuthService.logout();
        dispose();
        MainFrame.launch();
    }

    public static void launch() {
        SwingUtilities.invokeLater(() -> {
            LoginDialog login = new LoginDialog(null);
            login.setVisible(true);
            User user = login.getAuthenticatedUser();
            if (user != null) {
                new MainFrame(user).setVisible(true);
            } else {
                System.exit(0);
            }
        });
    }
}