package app.service;

import app.patterns.template.CheckInProcess;
import app.patterns.template.CheckOutProcess;
import app.patterns.template.HostelProcess;

public class ProcessService {

    public boolean executeCheckIn(int allocationId, int studentId, int roomId) {
        HostelProcess process = new CheckInProcess();
        return process.executeProcess(allocationId, studentId, roomId);
    }

    public boolean executeCheckOut(int allocationId, int studentId, int roomId) {
        HostelProcess process = new CheckOutProcess();
        return process.executeProcess(allocationId, studentId, roomId);
    }
}