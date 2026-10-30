package app.repository;

import app.patterns.singleton.ProcessDAO;

/**
 * Repository wrapper extending the Singleton ProcessDAO.
 */
public class ProcessRepository extends ProcessDAO {
    public ProcessRepository() {
        super();
    }
}
