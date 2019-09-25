import Serverless from "serverless";
import { OfflineIdentityService } from "../../services/offlineIdentityService";
import { AzureBasePlugin } from "../azureBasePlugin";

export class AzureOfflinePlugin extends AzureBasePlugin {

  public constructor(serverless: Serverless, options: Serverless.Options) {
    super(serverless, options);

    this.hooks = {
      "before:offline:offline": this.azureOfflineIdentityEval.bind(this),
      "before:offline:start:start": this.azureOfflineIdentityEval.bind(this),
    };

    this.commands = {
      offline: {
        usage: "Start Azure Function App offline",
        lifecycleEvents: [
          "offline",
        ],
        commands: {
          start: {
            usage: "Start Azure Function app - assumes offline build has already occurred",
            lifecycleEvents: [
              "start"
            ],
            options: {
              nocleanup: {
                usage: "Do not clean up offline files after finishing process",
                shortcut: "n",
              }
            }
          },
          build: {
            usage: "Build necessary files for running Azure Function App offline",
            lifecycleEvents: [
              "build",
            ]
          },
          cleanup: {
            usage: "Clean up files from offline development",
            lifecycleEvents: [
              "cleanup"
            ]
          }
        },
        options: {
          nocleanup: {
            usage: "Do not clean up offline files after finishing process",
            shortcut: "n",
          }
        }
      }
    }
  }

  private async azureOfflineIdentityEval(){
    if(!this.serverless.service.provider["keyVault"]){
      return;
    }
    const offlineIdentityService = new OfflineIdentityService(this.serverless, this.options);
    await offlineIdentityService.eval();
  }
}
