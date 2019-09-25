import { spawn, SpawnOptions } from "child_process";
import fs from "fs";
import Serverless from "serverless";
import configConstants from "../config";
import { BaseService } from "./baseService";
import { PackageService } from "./packageService";
import { SecretsClient } from "@azure/keyvault-secrets";
import { AzureKeyVaultConfig } from "../models/serverless";

export class OfflineIdentityService extends BaseService {

  public constructor(serverless: Serverless, options: Serverless.Options) {
    super(serverless, options, false);
  }

  /**
   * Spawn `func host start` from core func tools
   */
  public async eval() {
    const keyVaultConfig = this.serverless.service.provider["keyVault"] as AzureKeyVaultConfig;
    const url = `https://${keyVaultConfig.name}.vault.azure.net`;
    const keyVaultClient = new SecretsClient(url, this.credentials as any)
    const keys = Object.keys(this.config.provider.environment);
    for ( const key of keys) {
      try {
        keyVaultClient.getSecret(this.config.provider.environment[key])
      } catch (error) {
        throw Error(error);
      }
    }
  }
}
