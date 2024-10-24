// env.config.ts
import { InjectionToken } from "@angular/core";

export type EnvConfig = {
  apiUrl: string;
};

export const ENV_CONFIG = new InjectionToken<EnvConfig>('ENV_CONFIG', {
  factory: () => {
    return { apiUrl: 'http://localhost:3000' }
  }
})
