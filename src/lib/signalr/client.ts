export async function createFileHub() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const signalR = await import("@microsoft/signalr");
  return new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hub/files`)
    .withAutomaticReconnect()
    .build();
}
