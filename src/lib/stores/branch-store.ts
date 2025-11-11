import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Branch } from "@/types";

interface BranchStore {
  currentBranch: Branch | null;
  branches: Branch[];
  setCurrentBranch: (branch: Branch | null) => void;
  addBranch: (branch: Branch) => void;
  removeBranch: (branchId: string) => void;
  setBranches: (branches: Branch[]) => void;
}

export const useBranchStore = create<BranchStore>()(
  persist(
    (set) => ({
      currentBranch: null,
      branches: [],

      setCurrentBranch: (branch) =>
        set({ currentBranch: branch }),

      addBranch: (branch) =>
        set((state) => ({
          branches: [branch, ...state.branches],
        })),

      removeBranch: (branchId) =>
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== branchId),
          currentBranch:
            state.currentBranch?.id === branchId ? null : state.currentBranch,
        })),

      setBranches: (branches) =>
        set({ branches }),
    }),
    {
      name: "branch-storage",
      storage: createJSONStorage(() => localStorage),
      // Persist currentBranch per world
      partialize: (state) => ({ currentBranch: state.currentBranch }),
    }
  )
);
