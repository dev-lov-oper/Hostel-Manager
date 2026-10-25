package app.model;

public class User {
    private final int userId;
    private final String username;
    private final String passwordHash;
    private final Role role;
    private final String fullName;
    private final String email;

    public User(int userId, String username, String passwordHash, Role role, String fullName, String email) {
        this.userId = userId;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.fullName = fullName;
        this.email = email;
    }

    public int getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
}