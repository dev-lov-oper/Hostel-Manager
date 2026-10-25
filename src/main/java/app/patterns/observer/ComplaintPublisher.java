package app.patterns.observer;

import app.model.Complaint;
import java.util.ArrayList;
import java.util.List;

public class ComplaintPublisher {
    private final List<ComplaintObserver> observers = new ArrayList<>();

    public void attach(ComplaintObserver observer) {
        observers.add(observer);
    }

    public void detach(ComplaintObserver observer) {
        observers.remove(observer);
    }

    public void notifyObservers(Complaint complaint, String eventType, String details) {
        for (ComplaintObserver observer : observers) {
            observer.onComplaintEvent(complaint, eventType, details);
        }
    }
}