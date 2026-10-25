package app.model;

/**
 * Domain Model: Hostel
 * Represents a hostel building/block within the campus.
 */
public class Hostel {
    private final int hostelId;
    private final String hostelName;
    private final String genderType; // MALE, FEMALE, COED
    private final int totalFloors;

    public Hostel(int hostelId, String hostelName, String genderType, int totalFloors) {
        this.hostelId = hostelId;
        this.hostelName = hostelName;
        this.genderType = genderType;
        this.totalFloors = totalFloors;
    }

    public int getHostelId() { return hostelId; }
    public String getHostelName() { return hostelName; }
    public String getGenderType() { return genderType; }
    public int getTotalFloors() { return totalFloors; }

    @Override
    public String toString() {
        return hostelName + " (" + genderType + ")";
    }
}