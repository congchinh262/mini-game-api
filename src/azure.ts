import { SecretClient } from "@azure/keyvault-secrets";
import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
import { AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, KEY_VAULT_NAME } from "../conf";

export namespace Azure {
  const credential = new ClientSecretCredential("fd98a8b7-59d7-4921-903e-2d3011f70e81","4f8a47f5-620a-4fc4-97fe-35639af177af","APC8Q~sSC7FN5ilDuDeqlWLEDKTi72v3zUiJ2cQ6");
  const url = "https://" + KEY_VAULT_NAME + ".vault.azure.net";
  const client = new SecretClient(url, credential);
  export const getSecrets = async (name: string) => {
    try {
      const secret = await client.getSecret(name);
      if (!secret) {
        throw new Error("Secret not found!");
      }
      return secret.value;
    } catch (e) {
      throw new Error(`${e}`);
    }
  };
}
