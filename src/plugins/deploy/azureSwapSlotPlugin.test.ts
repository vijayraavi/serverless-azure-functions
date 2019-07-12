import { MockFactory } from "../../test/mockFactory";
import { invokeHook } from "../../test/utils";
import { AzureSwapSlotPlugin } from "./azureSwapSlotPlugin";

describe("Azure Swap Slot Plugin", () => {

  it("displays a help message", async () => {
    const sls = MockFactory.createTestServerless();
    const options = MockFactory.createTestServerlessOptions();
    const plugin = new AzureSwapSlotPlugin(sls, options);
    await invokeHook(plugin, "swap:swap");
    expect(sls.cli.log).lastCalledWith("Use the swap plugin to swap slots in Azure Functions")
  });
});
