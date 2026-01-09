export interface Config {
  mongodb: {
    uri: string;
  };
  logger: {
    level: string;
    activateLogColor: boolean;
    logRequests: boolean;
  };
  commure: {
    url: string;
    authToken: string;
  };
  backend: {
    url: string;
    token: string;
  };
  llm: {
    ragVerbose: boolean;
    ragkElements: number;
  };
  auth0: {
    issuerBaseUrl: string;
    audience: string;
    tokenSigningAlg: string;
    clientId: string;
    clientSecret: string;
  };
}
