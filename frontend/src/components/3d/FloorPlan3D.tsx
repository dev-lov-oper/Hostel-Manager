import React, { useState } from 'react';
import { Room } from '../../types';
import { Users, Wifi, Wind, ShieldCheck, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { PatternPill } from '../common/PatternPill';

interface FloorPlan3DProps {
  rooms: Room[];
  selectedFloor: number;
  onSelectRoom?: (room: Room) => void;
  selectedRoomId?: number | null;
}

export const FloorPlan3D: React.FC<FloorPlan3DProps> = ({
  rooms,
  selectedFloor,
  onSelectRoom,
  selectedRoomId
}) => {
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);

  // Filter rooms for the active floor
  const floorRooms = rooms.filter((r) => r.floorNumber === selectedFloor);

  const getStatusColor = (status: string, currentOccupancy: number, capacity: number) => {
    if (status === 'MAINTENANCE') {
      return {
        bg: 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-300',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
        label: 'Under Maintenance'
      };
    }
    if (status === 'FULL' || currentOccupancy >= capacity) {
      return {
        bg: 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/40 text-purple-300',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        dot: 'bg-purple-400',
        label: 'Fully Occupied'
      };
    }
    return {
      bg: 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-300',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      dot: 'bg-cyan-400',
      label: 'Available'
    };
  };

  const activeInspectRoom = hoveredRoom || floorRooms.find((r) => r.roomId === selectedRoomId) || floorRooms[0];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      {/* Header with floor statistics */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">
              Interactive Floor {selectedFloor} Plan
            </h3>
            <PatternPill name="Prototype Pattern" category="Room Clones" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any room block to inspect live occupancy, amenities & allocation status
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-glow-violet" />
            <span className="text-slate-300">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-slate-300">Maintenance</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Isometric 3D Room Grid View */}
        <div className="lg:col-span-2 bg-[#090d16] rounded-xl p-6 border border-white/[0.06] relative overflow-hidden">
          {/* Subtle architectural grid lines */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Central Corridor Indicator */}
          <div className="text-center py-2 mb-4 bg-white/[0.02] border border-dashed border-white/10 rounded-lg text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            — North Wing Corridor & Balcony Vista —
          </div>

          {/* Interactive Room Tiles */}
          {floorRooms.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No rooms configured for Floor {selectedFloor} in this block.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
              {floorRooms.map((room) => {
                const colors = getStatusColor(room.status, room.currentOccupancy, room.capacity);
                const isSelected = selectedRoomId === room.roomId;

                return (
                  <button
                    key={room.roomId}
                    type="button"
                    onClick={() => onSelectRoom && onSelectRoom(room)}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    className={`relative text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${colors.bg} ${
                      isSelected
                        ? 'ring-2 ring-brand-cyan shadow-glow-cyan scale-[1.02]'
                        : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold font-mono text-white tracking-wide">
                        {room.roomNumber}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
                    </div>

                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-[11px] text-slate-400">Occupancy:</span>
                        <span className="font-semibold">
                          {room.currentOccupancy} / {room.capacity}
                        </span>
                      </div>

                      {/* Capacity progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            room.status === 'MAINTENANCE'
                              ? 'bg-rose-500'
                              : room.currentOccupancy >= room.capacity
                              ? 'bg-purple-500'
                              : 'bg-cyan-400'
                          }`}
                          style={{
                            width: `${Math.min(100, (room.currentOccupancy / room.capacity) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                      <span className="truncate max-w-[90px]">
                        Floor {room.floorNumber}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${colors.badge}`}>
                        {room.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Central Corridor Indicator Bottom */}
          <div className="text-center py-2 mt-4 bg-white/[0.02] border border-dashed border-white/10 rounded-lg text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            — South Wing Corridor & Study Lounges —
          </div>
        </div>

        {/* Live Room Inspector Panel */}
        {activeInspectRoom ? (
          <div className="bg-[#0e1320] rounded-xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Room Inspector
                </span>
                <h4 className="text-xl font-bold font-mono text-white">
                  {activeInspectRoom.roomNumber}
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${
                getStatusColor(activeInspectRoom.status, activeInspectRoom.currentOccupancy, activeInspectRoom.capacity).badge
              }`}>
                {activeInspectRoom.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-cyan" /> Capacity
                </span>
                <span className="font-semibold text-slate-200">
                  {activeInspectRoom.currentOccupancy} of {activeInspectRoom.capacity} Beds Booked
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.03] space-y-1.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-mono">
                  Room Amenities
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeInspectRoom.amenities && activeInspectRoom.amenities.length > 0 ? (
                    activeInspectRoom.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 text-[11px] flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        {item.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">Standard room fixtures</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-brand-violet/10 border border-brand-violet/20 text-[11px] space-y-1 text-slate-300">
                <div className="font-semibold text-brand-sky flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Prototype Pattern Verified
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Amenities and specifications cloned independently from base template #
                  {activeInspectRoom.templateId} via RoomTemplate.clonePrototype().
                </p>
              </div>

              {onSelectRoom && (
                <button
                  type="button"
                  onClick={() => onSelectRoom(activeInspectRoom)}
                  className="w-full mt-2 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 shadow-glow-cyan transition-all"
                >
                  Select Room {activeInspectRoom.roomNumber}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#0e1320] rounded-xl p-6 text-center text-xs text-slate-500 border border-white/10">
            Hover or click a room to view details.
          </div>
        )}
      </div>
    </div>
  );
};

