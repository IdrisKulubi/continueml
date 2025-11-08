import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { World } from "@/types";

interface WorldStore {
  currentWorld: World | null;
  worlds: World[];
  setCurrentWorld: (world: World | null) => void;
  addWorld: (world: World) => void;
  updateWorld: (worldId: string, data: Partial<World>) => void;
  removeWorld: (worldId: string) => void;
  setWorlds: (worlds: World[]) => void;
}

export const useWorldStore = create<WorldStore>()(
  persist(
    (set) => ({
      currentWorld: null,
      worlds: [],

      setCurrentWorld: (world) =>
        set({ currentWorld: world }),

      addWorld: (world) =>
        set((state) => ({
          worlds: [world, ...state.worlds],
        })),

      updateWorld: (worldId, data) =>
        set((state) => ({
          worlds: state.worlds.map((w) =>
            w.id === worldId ? { ...w, ...data } : w
          ),
          currentWorld:
            state.currentWorld?.id === worldId
              ? { ...state.currentWorld, ...data }
              : state.currentWorld,
        })),

      removeWorld: (worldId) =>
        set((state) => ({
          worlds: state.worlds.filter((w) => w.id !== worldId),
          currentWorld:
            state.currentWorld?.id === worldId ? null : state.currentWorld,
        })),

      setWorlds: (worlds) =>
        set({ worlds }),
    }),
    {
      name: "world-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist currentWorld, not the full worlds list
      partialize: (state) => ({ currentWorld: state.currentWorld }),
    }
  )
);
