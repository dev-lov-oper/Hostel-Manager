package app.service;

import app.model.User;
import app.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;

public class AuthService {

    private static User currentSessionUser;
    private final UserRepository userRepository;

    public AuthService() {
        this.userRepository = new UserRepository();
    }

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Static logout method to allow direct invocation from menu/UI components.
     */
    public static void logout() {
        if (currentSessionUser != null) {
            System.out.println("User '" + currentSessionUser.getUsername() + "' logged out successfully.");
        }
        currentSessionUser = null;
    }

    /**
     * Authenticates a user given their username and raw password.
     * Supports both BCrypt hashed passwords and direct plain-text matching.
     */
    public User authenticate(String username, String rawPassword) {
        if (username == null || rawPassword == null || username.trim().isEmpty()) {
            return null;
        }

        User user = userRepository.findByUsername(username.trim());
        if (user == null) {
            System.err.println("Auth Failed: User '" + username + "' not found.");
            return null;
        }

        String storedHash = user.getPasswordHash();

        // 1. Direct plain-text comparison fallback
        if (rawPassword.equals(storedHash)) {
            currentSessionUser = user;
            return user;
        }

        // 2. BCrypt hash check
        try {
            if (storedHash != null && storedHash.startsWith("$2a$") && BCrypt.checkpw(rawPassword, storedHash)) {
                currentSessionUser = user;
                return user;
            }
        } catch (Exception e) {
            System.err.println("BCrypt Verification Error: " + e.getMessage());
        }

        System.err.println("Auth Failed: Invalid password for user '" + username + "'.");
        return null;
    }

    /**
     * Alias method for authenticate.
     */
    public User login(String username, String rawPassword) {
        return authenticate(username, rawPassword);
    }

    /**
     * Gets the currently logged-in user.
     */
    public static User getCurrentUser() {
        return currentSessionUser;
    }
}