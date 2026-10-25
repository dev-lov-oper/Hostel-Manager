package app.model;

import java.sql.Timestamp;

public class Notification {
    private final int notificationId;
    private final int userId;
    private final String title;
    private final String message;
    private final boolean read;
    private final Timestamp createdAt;

    public Notification(int notificationId, int userId, String title, String message, boolean read, Timestamp createdAt) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.read = read;
        this.createdAt = createdAt;
    }

    public int getNotificationId() { return notificationId; }
    public int getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public Timestamp getCreatedAt() { return createdAt; }
}