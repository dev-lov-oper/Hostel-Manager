package app.patterns.prototype;

import app.model.RoomTemplate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Registry for managing and cloning Room Templates (Prototype Pattern)
 */
public class RoomPrototypeRegistry {
    private static RoomPrototypeRegistry defaultRegistryInstance;
    private final Map<String, RoomTemplate> registry = new HashMap<>();

    public static synchronized RoomPrototypeRegistry getDefaultInstance() {
        if (defaultRegistryInstance == null) {
            defaultRegistryInstance = new RoomPrototypeRegistry();
        }
        return defaultRegistryInstance;
    }

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

    public boolean hasTemplate(String key) {
        return registry.containsKey(key);
    }

    public Map<String, RoomTemplate> getAllTemplates() {
        return Collections.unmodifiableMap(registry);
    }

    public void loadFromList(List<RoomTemplate> templates) {
        if (templates != null) {
            for (RoomTemplate t : templates) {
                registerTemplate(t.getTemplateName(), t);
            }
        }
    }
}
