package app.repository;

import app.patterns.singleton.ComplaintDAO;

/**
 * Repository wrapper extending the Singleton ComplaintDAO.
 */
public class ComplaintRepository extends ComplaintDAO {
    public ComplaintRepository() {
        super();
    }
}
