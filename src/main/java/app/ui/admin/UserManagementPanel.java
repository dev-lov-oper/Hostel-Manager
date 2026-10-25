package app.ui.admin;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class UserManagementPanel extends JPanel {

    public UserManagementPanel() {
        setLayout(new BorderLayout(15, 15));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("User Accounts & Role Management");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        add(title, BorderLayout.NORTH);

        String[] columns = {"User ID", "Username", "Role", "Full Name", "Email", "Status"};
        Object[][] data = {
                {1, "admin", "ADMIN", "System Admin", "admin@hostel.edu", "ACTIVE"},
                {2, "warden_b1", "WARDEN", "Dr. John Smith", "warden1@hostel.edu", "ACTIVE"},
                {3, "chief_warden", "CHIEF_WARDEN", "Prof. Alice Brown", "chief@hostel.edu", "ACTIVE"},
                {4, "dean_office", "DEAN", "Dr. Robert Vance", "dean@hostel.edu", "ACTIVE"},
                {5, "maint_tech1", "MAINTENANCE", "David Tech", "maint1@hostel.edu", "ACTIVE"}
        };

        JTable userTable = new JTable(new DefaultTableModel(data, columns));
        add(new JScrollPane(userTable), BorderLayout.CENTER);
    }
}