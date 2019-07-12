import Serverless from "serverless";
import { AzureBasePlugin } from "../azureBasePlugin";

export class AzureSwapSlotPlugin extends AzureBasePlugin {
  public hooks: { [eventName: string]: Promise<any> };
  public commands: any;

  public constructor(serverless: Serverless, options: Serverless.Options) {
    super(serverless, options);

    this.hooks = {
      "swap:swap": this.swap.bind(this),
    };

    this.commands = {
      swap: {
        usage: "Add or remove functions",
        lifecycleEvents: [
          "swap",
        ],
        options: {
          sourceSlot: {
            usage: "Source slot for swap",
            shortcut: "s"
          },
          targetSlot: {
            usage: "Target slot for swap",
            shortcut: "t"
          }
        }
      }
    }
  }

  private async swap() {
    this.log("Use the swap plugin to swap slots in Azure Functions");
  }
}
