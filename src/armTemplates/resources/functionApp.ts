import { ArmResourceTemplate, ArmResourceTemplateGenerator } from "../../models/armTemplates";
import { FunctionAppConfig, ServerlessAzureConfig } from "../../models/serverless";
import { AzureNamingService } from "../../services/namingService";

export class FunctionAppResource implements ArmResourceTemplateGenerator {
  public static getResourceName(config: ServerlessAzureConfig) {
    const safeServiceName = config.service.replace(/\s/g, "-");
    return AzureNamingService.getResourceName(
      config,
      config.provider.appInsights,
      safeServiceName
    );
  }

  public getTemplate(): ArmResourceTemplate {
    return {
      "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "functionAppRunFromPackage": {
          "defaultValue": "1",
          "type": "String"
        },
        "functionAppName": {
          "defaultValue": "",
          "type": "String"
        },
        "functionAppNodeVersion": {
          "defaultValue": "10.14.1",
          "type": "String"
        },
        "functionAppWorkerRuntime": {
          "defaultValue": "node",
          "type": "String"
        },
        "functionAppExtensionVersion": {
          "defaultValue": "~2",
          "type": "String"
        },
        "storageAccountName": {
          "defaultValue": "",
          "type": "String"
        },
        "appInsightsName": {
          "defaultValue": "",
          "type": "String"
        },
        "location": {
          "defaultValue": "",
          "type": "String"
        },
        "slotName": {
          "defaultValue": "",
          "type": "String"
        }
      },
      "variables": {},
      "resources": [
        {
          "type": "Microsoft.Web/sites",
          "apiVersion": "2016-03-01",
          "name": "[parameters('functionAppName')]",
          "location": "[parameters('location')]",
          "dependsOn": [
            "[resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName'))]",
            "[concat('microsoft.insights/components/', parameters('appInsightsName'))]"
          ],
          "kind": "functionapp",
          "properties": {
            "siteConfig": {
              "appSettings": [
                {
                  "name": "FUNCTIONS_WORKER_RUNTIME",
                  "value": "[parameters('functionAppWorkerRuntime')]"
                },
                {
                  "name": "FUNCTIONS_EXTENSION_VERSION",
                  "value": "[parameters('functionAppExtensionVersion')]"
                },
                {
                  "name": "AzureWebJobsStorage",
                  "value": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]"
                },
                {
                  "name": "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING",
                  "value": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]"
                },
                {
                  "name": "WEBSITE_CONTENTSHARE",
                  "value": "[toLower(parameters('functionAppName'))]"
                },
                {
                  "name": "WEBSITE_NODE_DEFAULT_VERSION",
                  "value": "[parameters('functionAppNodeVersion')]"
                },
                {
                  "name": "WEBSITE_RUN_FROM_PACKAGE",
                  "value": "[parameters('functionAppRunFromPackage')]"
                },
                {
                  "name": "APPINSIGHTS_INSTRUMENTATIONKEY",
                  "value": "[reference(concat('microsoft.insights/components/', parameters('appInsightsName'))).InstrumentationKey]"
                }
              ]
            },
            "name": "[parameters('functionAppName')]",
            "clientAffinityEnabled": false,
            "hostingEnvironment": ""
          },
          "resources": [
            {
              "name": "slotConfigNames",
              "type": "config",
              "apiVersion": "2015-08-01",
              "dependsOn": [
                "[resourceId('Microsoft.Web/sites', parameters('functionAppName'))]",
              ],
              "tags": {
                "displayName": "slotConfigNames"
              },
              "properties": {
                "appSettingNames": [
                  "StickySetting",
                  "WEBSITE_CONTENTSHARE"
                ]
              }
            },
            {
              "apiVersion": "2015-08-01",
              "name": "appsettings",
              "type": "config",
              "dependsOn": [
                "[resourceId('Microsoft.Web/sites', parameters('functionAppName'))]",
                "[resourceId('Microsoft.Insights/components', parameters('appInsightsName'))]"
              ],
              "properties": {
                "AzureWebJobsDashboard": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]",
                "AzureWebJobsStorage": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]",
                "FUNCTIONS_EXTENSION_VERSION": "[parameters('functionAppExtensionVersion')]",
                "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]",
                "WEBSITE_CONTENTSHARE": "[parameters('functionAppName')]",
                "WEBSITE_NODE_DEFAULT_VERSION": "[parameters('functionAppNodeVersion')]",
                "APPINSIGHTS_INSTRUMENTATIONKEY": "[reference(resourceId('Microsoft.Insights/components', parameters('appInsightsName')), '2014-04-01').InstrumentationKey]",
                "StickySetting": "AlwaysWithProductionSlot",
                "AzureWebJobsSecretStorageType": "Blob"
              }
            },
            {
              "apiVersion": "2015-08-01",
              "name": "[parameters('slotName')]",
              "type": "slots",
              "tags": {
                "displayName": "[concat(parameters('slotName'), ' Deployment Slot')]"
              },
              "location": "[parameters('location')]",
              "dependsOn": [
                "[resourceId('Microsoft.Web/Sites', parameters('functionAppName'))]"
              ],
              "properties": {},
              "resources": [
                {
                  "apiVersion": "2015-08-01",
                  "name": "appsettings",
                  "type": "config",
                  "dependsOn": [
                    "[resourceId('Microsoft.Web/sites', parameters('functionAppName'))]",
                    "[resourceId('Microsoft.Insights/components', parameters('appInsightsName'))]",
                    "[resourceId('Microsoft.Web/sites/slots', parameters('functionAppName'), parameters('slotName'))]"
                  ],
                  "properties": {
                    "AzureWebJobsDashboard": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]",
                    "AzureWebJobsStorage": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]",
                    "FUNCTIONS_EXTENSION_VERSION": "[parameters('functionAppExtensionVersion')]",
                    "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING": "[concat('DefaultEndpointsProtocol=https;AccountName=',parameters('storageAccountName'),';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2016-01-01').keys[0].value)]",
                    "WEBSITE_CONTENTSHARE": "[parameters('functionAppName')]",
                    "WEBSITE_NODE_DEFAULT_VERSION": "[parameters('functionAppNodeVersion')]",
                    "APPINSIGHTS_INSTRUMENTATIONKEY": "[reference(resourceId('Microsoft.Insights/components', parameters('appInsightsName')), '2014-04-01').InstrumentationKey]",
                    "StickySetting": "AlwaysWithProductionSlot",
                    "AzureWebJobsSecretStorageType": "Blob"
                  }
                },
                {
                  "apiVersion": "2015-08-01",
                  "type": "config",
                  "name": "web",
                  "dependsOn": [
                    "[resourceId('Microsoft.Web/sites', parameters('functionAppName'))]",
                    "[resourceId('Microsoft.Web/sites/slots', parameters('functionAppName'), parameters('slotName'))]"
                  ],
                  "properties": {
                    "use32BitWorkerProcess": false
                  }
                }
              ]
            },
            {
              "apiVersion": "2015-08-01",
              "type": "config",
              "name": "web",
              "dependsOn": [
                "[resourceId('Microsoft.Web/sites', parameters('functionAppName'))]"
              ],
              "properties": {
                "use32BitWorkerProcess": false
              }
            }
          ]
        }
      ]
    }
  }

  public getParameters(config: ServerlessAzureConfig): any {
    const resourceConfig: FunctionAppConfig = {
      ...config.provider.functionApp,
    };

    return {
      functionAppName: FunctionAppResource.getResourceName(config),
      functionAppNodeVersion: resourceConfig.nodeVersion,
      functionAppWorkerRuntime: resourceConfig.workerRuntime,
      functionAppExtensionVersion: resourceConfig.extensionVersion,
      slotName: "canary",
    };
  }
}
