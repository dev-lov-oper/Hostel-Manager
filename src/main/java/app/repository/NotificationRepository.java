package app.repository;

import app.patterns.singleton.NotificationDAO;

/**
 * Repository wrapper extending the Singleton NotificationDAO.
 */
public class NotificationRepository extends NotificationDAO {
    public NotificationRepository() {
        super();
    }
}
