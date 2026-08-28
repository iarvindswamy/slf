"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Module =
  | "LOGISTICS"
  | "FOOD";

type ModuleContextValue = {
  module: Module;
  setModule: (
    module: Module,
  ) => void;

  isLogistics: boolean;
  isFood: boolean;
};

const ModuleContext =
  createContext<
    ModuleContextValue | undefined
  >(undefined);

const STORAGE_KEY =
  "sreshta-active-module";

export function ModuleProvider({
  children,
  defaultModule = "LOGISTICS",
}: {
  children: ReactNode;
  defaultModule?: Module;
}) {
  const [module, setModuleState] =
    useState<Module>(
      defaultModule,
    );

  useEffect(() => {
    const saved =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (
      saved === "LOGISTICS" ||
      saved === "FOOD"
    ) {
      setModuleState(saved);
    }
  }, []);

  const setModule = (
    nextModule: Module,
  ) => {
    setModuleState(nextModule);

    window.localStorage.setItem(
      STORAGE_KEY,
      nextModule,
    );
  };

  const value = useMemo(
    () => ({
      module,
      setModule,
      isLogistics:
        module === "LOGISTICS",
      isFood:
        module === "FOOD",
    }),
    [module],
  );

  return (
    <ModuleContext.Provider
      value={value}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const context =
    useContext(ModuleContext);

  if (!context) {
    throw new Error(
      "useModule must be used inside ModuleProvider.",
    );
  }

  return context;
}