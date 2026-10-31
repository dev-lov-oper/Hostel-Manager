package app.patterns;

import app.patterns.prototype.RoomTemplate;
import app.patterns.prototype.RoomPrototypeRegistry;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class PrototypeTest {

    @Test
    public void testTemplateCloningIsolation() {
        RoomPrototypeRegistry registry = new RoomPrototypeRegistry();
        RoomTemplate masterTemplate = new RoomTemplate(
                1, "Deluxe Single", "SINGLE", 1, 5000.0, List.of("AC", "Wi-Fi", "Study Desk")
        );
        registry.registerTemplate("SINGLE_DELUXE", masterTemplate);

        RoomTemplate clone1 = registry.getClonedTemplate("SINGLE_DELUXE");
        RoomTemplate clone2 = registry.getClonedTemplate("SINGLE_DELUXE");

        assertNotSame(clone1, clone2); // Distinct objects in memory
        assertNotSame(clone1.getAmenities(), clone2.getAmenities()); // Independent mutable lists

        // Modify clone1 amenities
        clone1.addAmenity("Attached Balcony");

        // Verify master template and clone2 remain unchanged
        assertEquals(3, masterTemplate.getAmenities().size());
        assertEquals(4, clone1.getAmenities().size());
        assertEquals(3, clone2.getAmenities().size());
    }
}