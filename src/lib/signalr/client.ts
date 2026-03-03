import * as signalR from "@microsoft/signalr";

export function createFileHub(baseUrl: string) {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hub/files`)
    .withAutomaticReconnect()
    .build();
}
