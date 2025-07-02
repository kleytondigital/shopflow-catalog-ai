// Utilitário para controlar debug e logging baseado no ambiente

const isDevelopment = import.meta.env.MODE === "development";
const isDebugEnabled =
  import.meta.env.VITE_DEBUG_MODE === "true" || isDevelopment;

export const debug = {
  log: (...args: any[]) => {
    if (isDebugEnabled) {
      console.log("[DEBUG]", ...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDebugEnabled) {
      console.warn("[WARN]", ...args);
    }
  },

  error: (...args: any[]) => {
    // Erros sempre são mostrados, independente do ambiente
    console.error("[ERROR]", ...args);
  },

  info: (...args: any[]) => {
    if (isDebugEnabled) {
      console.info("[INFO]", ...args);
    }
  },

  table: (data: any) => {
    if (isDebugEnabled) {
      console.table(data);
    }
  },

  group: (label: string) => {
    if (isDebugEnabled) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDebugEnabled) {
      console.groupEnd();
    }
  },

  time: (label: string) => {
    if (isDebugEnabled) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDebugEnabled) {
      console.timeEnd(label);
    }
  },
};

// Export também as funções individuais para facilitar o uso
export const { log, warn, error, info, table, group, groupEnd, time, timeEnd } =
  debug;

// Função para verificar se está em modo de debug
export const isDebug = () => isDebugEnabled;

// Função para verificar se está em produção
export const isProduction = () => import.meta.env.MODE === "production";

// Função para verificar se está em desenvolvimento
export const isDev = () => isDevelopment;
