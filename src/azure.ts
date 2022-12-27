import { SecretClient } from "@azure/keyvault-secrets";
import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
import { AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, KEY_VAULT_NAME } from "../conf";

export namespace Azure {
  const credential = new ClientSecretCredential(process.env.AZURE_TENANT_ID!,process.env.AZURE_CLIENT_ID!,process.env.AZURE_CLIENT_SECRET!);
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
