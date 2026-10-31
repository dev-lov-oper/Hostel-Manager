package app.patterns.prototype;

import java.util.ArrayList;
import java.util.List;

/**
 * Prototype Pattern Concrete Class: RoomTemplate
 */
public class RoomTemplate implements RoomPrototype {
    private int templateId;
    private String templateName;
    private String roomType; // SINGLE, DOUBLE, DORMITORY
    private int capacity;
    private double baseFee;
    private List<String> amenities;

    public RoomTemplate(int templateId, String templateName, String roomType, int capacity, double baseFee, List<String> amenities) {
        this.templateId = templateId;
        this.templateName = templateName;
        this.roomType = roomType;
        this.capacity = capacity;
        this.baseFee = baseFee;
        this.amenities = amenities != null ? new ArrayList<>(amenities) : new ArrayList<>();
    }

    public int getTemplateId() { return templateId; }
    public String getTemplateName() { return templateName; }
    public String getRoomType() { return roomType; }
    public int getCapacity() { return capacity; }
    public double getBaseFee() { return baseFee; }
    public List<String> getAmenities() { return amenities; }

    public void addAmenity(String amenity) {
        this.amenities.add(amenity);
    }

    @Override
    public RoomTemplate clonePrototype() {
        List<String> clonedAmenities = new ArrayList<>(this.amenities);
        return new RoomTemplate(
                this.templateId,
                this.templateName,
                this.roomType,
                this.capacity,
                this.baseFee,
                clonedAmenities
        );
    }
}
