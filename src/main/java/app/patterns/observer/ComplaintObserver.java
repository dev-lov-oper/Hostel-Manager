package app.patterns.observer;

import app.model.Complaint;

public interface ComplaintObserver {
    void onComplaintEvent(Complaint complaint, String eventType, String details);
}