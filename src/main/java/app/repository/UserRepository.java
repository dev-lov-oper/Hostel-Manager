package app.repository;

import app.patterns.singleton.UserDAO;

/**
 * Repository wrapper extending the Singleton UserDAO.
 */
public class UserRepository extends UserDAO {
    public UserRepository() {
        super();
    }
}
