package app.ui.components;

import javax.swing.*;
import java.awt.*;

public class StatCardPanel extends JPanel {

    private final JLabel valueLabel;

    public StatCardPanel(String title, String initialValue, Color cardColor) {
        setLayout(new BorderLayout());
        setBackground(cardColor);
        setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));
        setPreferredSize(new Dimension(180, 90));

        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 12));
        titleLabel.setForeground(Color.WHITE);

        valueLabel = new JLabel(initialValue);
        valueLabel.setFont(new Font("SansSerif", Font.BOLD, 24));
        valueLabel.setForeground(Color.WHITE);

        add(titleLabel, BorderLayout.NORTH);
        add(valueLabel, BorderLayout.CENTER);
    }

    public void setValue(String value) {
        valueLabel.setText(value);
    }
}