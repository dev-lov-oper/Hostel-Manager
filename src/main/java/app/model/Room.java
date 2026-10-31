package app.model;

import app.patterns.prototype.RoomTemplate;
import java.util.List;

/**
 * Domain Model: Room (Generated from RoomTemplate Prototype)
 */
public class Room {
    private int roomId;
    private int hostelId;
    private int templateId;
    private String roomNumber;
    private int floorNumber;
    private int capacity;
    private int currentOccupancy;
    private String status; // AVAILABLE, FULL, MAINTENANCE
    private List<String> amenities;

    public Room(int roomId, int hostelId, RoomTemplate template, String roomNumber, int floorNumber) {
        this.roomId = roomId;
        this.hostelId = hostelId;
        this.templateId = template.getTemplateId();
        this.roomNumber = roomNumber;
        this.floorNumber = floorNumber;
        this.capacity = template.getCapacity();
        this.currentOccupancy = 0;
        this.status = "AVAILABLE";
        // Copy amenities independently from template clone
        this.amenities = template.clonePrototype().getAmenities();
    }

    public int getRoomId() { return roomId; }
    public int getHostelId() { return hostelId; }
    public int getTemplateId() { return templateId; }
    public String getRoomNumber() { return roomNumber; }
    public int getFloorNumber() { return floorNumber; }
    public int getCapacity() { return capacity; }
    public int getCurrentOccupancy() { return currentOccupancy; }
    public String getStatus() { return status; }
    public List<String> getAmenities() { return amenities; }

    public void setCurrentOccupancy(int currentOccupancy) {
        this.currentOccupancy = currentOccupancy;
        if (this.currentOccupancy >= this.capacity) {
            this.status = "FULL";
        } else if (!"MAINTENANCE".equals(this.status)) {
            this.status = "AVAILABLE";
        }
    }

    public void setStatus(String status) {
        this.status = status;
    }
}