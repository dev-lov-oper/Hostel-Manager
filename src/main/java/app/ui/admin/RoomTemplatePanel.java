package app.ui.admin;

import app.model.RoomTemplate;
import app.patterns.prototype.RoomPrototypeRegistry;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class RoomTemplatePanel extends JPanel {

    private final RoomPrototypeRegistry registry = new RoomPrototypeRegistry();
    private final DefaultTableModel tableModel;

    public RoomTemplatePanel() {
        setLayout(new BorderLayout(15, 15));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Header Title
        JLabel title = new JLabel("Room Prototype Template Management");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        add(title, BorderLayout.NORTH);

        // Table Setup
        String[] columns = {"Template ID", "Template Name", "Type", "Capacity", "Base Fee ($)", "Amenities"};
        tableModel = new DefaultTableModel(columns, 0);
        JTable table = new JTable(tableModel);

        // Pre-register Sample Prototype Templates
        RoomTemplate singleProto = new RoomTemplate(1, "Single Deluxe Prototype", "SINGLE", 1, 500.0, List.of("AC", "Wi-Fi", "Study Desk"));
        RoomTemplate doubleProto = new RoomTemplate(2, "Double Standard Prototype", "DOUBLE", 2, 350.0, List.of("Fan", "Wi-Fi", "Balcony"));
        
        registry.registerTemplate("SINGLE_DELUXE", singleProto);
        registry.registerTemplate("DOUBLE_STD", doubleProto);

        addTemplateToTable(singleProto);
        addTemplateToTable(doubleProto);

        add(new JScrollPane(table), BorderLayout.CENTER);

        // Bottom Controls: Clone Prototype Action
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton cloneBtn = new JButton("Clone Selected Prototype to New Room");
        cloneBtn.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row >= 0) {
                String name = (String) tableModel.getValueAt(row, 1);
                String key = name.contains("Single") ? "SINGLE_DELUXE" : "DOUBLE_STD";
                
                // Prototype Pattern Deep-Clone Call
                RoomTemplate cloned = registry.getClonedTemplate(key);
                JOptionPane.showMessageDialog(this, 
                        "Successfully cloned Prototype Template: " + cloned.getTemplateName() + 
                        "\nIndependent Amenities Copy: " + cloned.getAmenities(), 
                        "Prototype Pattern Execution", 
                        JOptionPane.INFORMATION_MESSAGE);
            } else {
                JOptionPane.showMessageDialog(this, "Please select a template from the table first.", "Selection Required", JOptionPane.WARNING_MESSAGE);
            }
        });

        buttonPanel.add(cloneBtn);
        add(buttonPanel, BorderLayout.SOUTH);
    }

    private void addTemplateToTable(RoomTemplate template) {
        tableModel.addRow(new Object[]{
                template.getTemplateId(),
                template.getTemplateName(),
                template.getRoomType(),
                template.getCapacity(),
                template.getBaseFee(),
                String.join(", ", template.getAmenities())
        });
    }
}