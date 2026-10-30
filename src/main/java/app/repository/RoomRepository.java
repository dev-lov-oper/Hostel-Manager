package app.repository;

import app.patterns.singleton.RoomDAO;

/**
 * Repository wrapper extending the Singleton RoomDAO.
 */
public class RoomRepository extends RoomDAO {
    public RoomRepository() {
        super();
    }
}
