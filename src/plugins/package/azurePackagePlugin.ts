
import Serverless from "serverless";
import AzureProvider from "../../provider/azureProvider";
import { PackageService } from "../../services/packageService";
import { AzureBasePlugin } from "../azureBasePlugin";
import { ServerlessCliCommand } from "../../models/serverless";
import { Utils } from "../../shared/utils";
import configConstants from "../../config";

export class AzurePackagePlugin extends AzureBasePlugin {
  private bindingsCreated: boolean = false;
  public provider: AzureProvider;

  public constructor(serverless: Serverless, options: Serverless.Options) {
    super(serverless, options);
    this.hooks = {
      "before:package:setupProviderConfiguration": this.setupProviderConfiguration.bind(this),
      "package:createDeploymentArtifacts": this.createCustomArtifact.bind(this),
      "before:webpack:package:packageModules": this.webpack.bind(this),
      "after:package:finalize": this.finalize.bind(this),
    };
    if (serverless.service.provider.runtime.includes("python")) {
      delete this.hooks["before:package:setupProviderConfiguration"];
      delete this.serverless.pluginManager.hooks["package:setupProviderConfiguration"]
      delete this.serverless.pluginManager.hooks["package:createDeploymentArtifacts"]

      this.hooks["package:setupProviderConfiguration"] = this.setupProviderConfiguration.bind(this),
      this.hooks["package:createDeploymentArtifacts"] = this.createCustomArtifact.bind(this);
    }
  }

  private async setupProviderConfiguration(): Promise<void> {
    const packageService = new PackageService(this.serverless, this.options);

    if (this.processedCommands[0] === ServerlessCliCommand.DEPLOY && this.getOption("package")) {
      this.log("Deploying pre-built package. No need to create bindings");
      return;
    }
    if (this.config.package && this.config.package.individually) {
      throw new Error("Cannot package Azure Functions individually. " +
        "Remove `individually` attribute from the `package` section of the serverless config");
    }
    packageService.cleanUpServerlessDir();
    await packageService.createBindings();
    
    this.bindingsCreated = true;

    return Promise.resolve();
  }

  private async webpack(): Promise<void> {
    const packageService = new PackageService(this.serverless, this.options);

    if (this.getOption("package")) {
      
      this.log("No need to perform webpack. Using pre-existing package");
      return Promise.resolve();
    }
    if (!this.bindingsCreated) {
      await this.setupProviderConfiguration();
    }

    await packageService.prepareWebpack();
  }

  private async createCustomArtifact(): Promise<void> {
    if (this.serverless.service.provider.runtime.includes("python")) {
      const packageService = new PackageService(this.serverless, this.options);
      await packageService.createPackage();
    }
  }

  /**
   * Cleans up generated folders & files after packaging is complete
   */
  private async finalize(): Promise<void> {
    const packageService = new PackageService(this.serverless, this.options);

    if (this.getOption("package")) {
      this.log("No need to clean up generated folders & files. Using pre-existing package");
      return Promise.resolve();
    }
    await packageService.cleanUp();
  }
}
