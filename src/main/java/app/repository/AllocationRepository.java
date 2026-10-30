package app.repository;

import app.patterns.singleton.AllocationDAO;

/**
 * Repository wrapper extending the Singleton AllocationDAO.
 */
public class AllocationRepository extends AllocationDAO {
    public AllocationRepository() {
        super();
    }
}
