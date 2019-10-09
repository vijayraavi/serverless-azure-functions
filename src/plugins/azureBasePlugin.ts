import Serverless from "serverless";
import { ServerlessAzureConfig, ServerlessCliCommand,
  ServerlessCommandMap, ServerlessHookMap, ServerlessObject } from "../models/serverless";
import { Guard } from "../shared/guard";
import { Utils } from "../shared/utils";

export abstract class AzureBasePlugin<TOptions=Serverless.Options> {

  public hooks: ServerlessHookMap
  protected config: ServerlessAzureConfig;
  protected commands: ServerlessCommandMap;
  protected processedCommands: ServerlessCliCommand[];
  /**
   * Specifies whether plugin should build its own deployment artifact
   * or leave it to the Serverless core to do it instead
   */
  protected buildCustomPackage: boolean;

  public constructor(
    protected serverless: Serverless,
    protected options: TOptions,
  ) {
    Guard.null(serverless);
    this.config = serverless.service as any;
    this.processedCommands = (serverless as any as ServerlessObject).processedInput.commands;
    this.buildCustomPackage = serverless.service.provider.runtime.includes("python");
  }

  protected log(message: string) {
    this.serverless.cli.log(message);
  }

  protected getOption(key: string, defaultValue?: any): string {
    return Utils.get(this.options, key, defaultValue);
  }
}
