export class UrlConstants {
  public readonly api: string = `https://api.yayfon.com/v2.0/`;
  public readonly login: string = `${this.api}sso/login`;
  public readonly online: string = `${this.api}console/account/online`;
  public readonly offline: string = `${this.api}console/account/offline`;
  public readonly widgetSettings: string = `${this.api}widget/caller-settings/`;
  public readonly server: string = `wss://wss.yayfon.com`;
}
