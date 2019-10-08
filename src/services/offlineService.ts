import { spawn, SpawnOptions } from "child_process";
import fs from "fs";
import Serverless from "serverless";
import configConstants from "../config";
import { BaseService } from "./baseService";
import { PackageService } from "./packageService";
import path from "path";
import { Utils } from "../shared/utils";

export class OfflineService extends BaseService {

  private packageService: PackageService;

  private localFiles = {
    "local.settings.json": JSON.stringify({
      IsEncrypted: false,
      Values: {
        AzureWebJobsStorage: "UseDevelopmentStorage=true",
        FUNCTIONS_WORKER_RUNTIME: this.config.provider.functionRuntime.language
      }
    }),
  }

  public constructor(serverless: Serverless, options: Serverless.Options) {
    super(serverless, options, false);
    this.packageService = new PackageService(serverless, options);
  }

  public async build() {
    this.log("Building offline service");
    await this.packageService.createBindings();
    const filenames = Object.keys(this.localFiles);
    for (const filename of filenames) {
      if (!fs.existsSync(filename)) {
        fs.writeFileSync(
          filename,
          this.localFiles[filename]
        )
      }
    }
    this.log("Finished building offline service");
  }

  public async cleanup() {
    this.log("Cleaning up offline files")
    await this.packageService.cleanUp();
    this.log("Finished cleaning up offline files");
  }

  /**
   * Spawn `func host start` from core func tools
   */
  public async start() {
    await Utils.spawn({
      serverless: this.serverless,
      command: configConstants.funcCoreTools,
      commandArgs: configConstants.funcCoreToolsStartArgs,
      onSigInt: async () => {
        try {
          if (this.getOption("nocleanup")) {
            this.log("Skipping offline file cleanup...");
          } else {
            await this.cleanup();
          }
        } catch {
          // Swallowing `scandir` error that gets thrown after
          // trying to remove the same directory twice
        } finally {
          process.exit();
        }
      }
    });
  }
}
