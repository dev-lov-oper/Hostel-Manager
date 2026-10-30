package app.repository;

import app.patterns.singleton.StudentDAO;

/**
 * Repository wrapper extending the Singleton StudentDAO.
 */
public class StudentRepository extends StudentDAO {
    public StudentRepository() {
        super();
    }
}
