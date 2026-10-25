package app.patterns.prototype;

/**
 * Prototype Pattern Interface
 */
public interface RoomPrototype extends Cloneable {
    RoomPrototype clonePrototype();
}