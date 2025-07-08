// Shared interface for the EmulatorJS instance on window
export interface EmulatorInstance {
  [key: string]: any;
  stop: () => void;
}
