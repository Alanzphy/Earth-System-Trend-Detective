import { createContext } from "react";

export type ChartDomain = [number, number];
export const ChartScaleContext = createContext<{
  domain: ChartDomain | null;
  register: (id: string, domain: ChartDomain | null) => void;
} | null>(null);
