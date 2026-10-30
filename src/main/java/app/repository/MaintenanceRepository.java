package app.repository;

import app.patterns.singleton.MaintenanceDAO;

/**
 * Repository wrapper extending the Singleton MaintenanceDAO.
 */
public class MaintenanceRepository extends MaintenanceDAO {
    public MaintenanceRepository() {
        super();
    }
}
