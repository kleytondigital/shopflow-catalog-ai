// Sistema de logging que respeita o ambiente

const isDevelopment = import.meta.env.MODE === "development";

// Interface para o logger
interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  table: (data: any) => void;
  group: (label: string) => void;
  groupEnd: () => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

// Logger que só funciona em desenvolvimento
const devLogger: Logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log("[LOG]", ...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn("[WARN]", ...args);
    }
  },

  error: (...args: any[]) => {
    // Erros sempre são mostrados
    console.error("[ERROR]", ...args);
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info("[INFO]", ...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug("[DEBUG]", ...args);
    }
  },

  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  group: (label: string) => {
    if (isDevelopment) {
      console.group(`[GROUP] ${label}`);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  time: (label: string) => {
    if (isDevelopment) {
      console.time(`[TIME] ${label}`);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(`[TIME] ${label}`);
    }
  },
};

// Logger que não faz nada (para produção)
const prodLogger: Logger = {
  log: () => {},
  warn: () => {},
  error: (...args: any[]) => console.error("[ERROR]", ...args), // Erros sempre são mostrados
  info: () => {},
  debug: () => {},
  table: () => {},
  group: () => {},
  groupEnd: () => {},
  time: () => {},
  timeEnd: () => {},
};

// Exporta o logger apropriado baseado no ambiente
export const logger = isDevelopment ? devLogger : prodLogger;

// Funções de conveniência
export const {
  log,
  warn,
  error,
  info,
  debug,
  table,
  group,
  groupEnd,
  time,
  timeEnd,
} = logger;

// Utilitários para verificar o ambiente
export const isProduction = () => import.meta.env.MODE === "production";
export const isDev = () => isDevelopment;

// Logger específico para o VendeMais
export const vendeLogger = {
  products: {
    create: (data: any) => logger.debug("Criando produto:", data),
    update: (id: string, data: any) =>
      logger.debug("Atualizando produto:", id, data),
    delete: (id: string) => logger.debug("Removendo produto:", id),
    fetch: (storeId: string) =>
      logger.debug("Buscando produtos da loja:", storeId),
  },

  variations: {
    create: (productId: string, variations: any[]) =>
      logger.debug("Criando variações para produto:", productId, variations),
    update: (variationId: string, data: any) =>
      logger.debug("Atualizando variação:", variationId, data),
  },

  store: {
    load: (storeId: string) =>
      logger.debug("Carregando dados da loja:", storeId),
    update: (storeId: string, data: any) =>
      logger.debug("Atualizando loja:", storeId, data),
  },

  auth: {
    login: (email: string) => logger.info("Login realizado:", email),
    logout: () => logger.info("Logout realizado"),
    error: (error: any) => logger.error("Erro de autenticação:", error),
  },

  api: {
    request: (url: string, method: string) =>
      logger.debug("API Request:", method, url),
    response: (url: string, status: number) =>
      logger.debug("API Response:", url, status),
    error: (url: string, error: any) => logger.error("API Error:", url, error),
  },
};

export default logger;
