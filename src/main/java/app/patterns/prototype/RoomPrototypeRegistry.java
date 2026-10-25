package app.patterns.prototype;

import app.model.RoomTemplate;
import java.util.HashMap;
import java.util.Map;

/**
 * Registry for managing and cloning Room Templates
 */
public class RoomPrototypeRegistry {
    private final Map<String, RoomTemplate> registry = new HashMap<>();

    public void registerTemplate(String key, RoomTemplate template) {
        registry.put(key, template);
    }

    public RoomTemplate getClonedTemplate(String key) {
        RoomTemplate template = registry.get(key);
        if (template == null) {
            throw new IllegalArgumentException("No room template registered under key: " + key);
        }
        return template.clonePrototype();
    }
}