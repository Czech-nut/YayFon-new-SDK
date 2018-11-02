import {UrlConstants} from "./urlConstants";

export class ConfigurationOptions {
  public config: any;
  private readonly urls: UrlConstants = new UrlConstants();
  constructor(userData: any) {
    this.config = {
      log: {
        builtinEnabled: false,
      },
      stunServers: [],
      traceSip: true,
      transportOptions: {
        wsServers: [this.urls.server],
      },
      turnServers: [],
      uri: `${userData.username}@${this.urls.serverHost}`,
    };

    if (userData.authKey) {
      this.config.password = userData.authKey;
      this.config.authorizationUser = userData.username;
      this.config.register = true;
    } else {
      this.config.register = false;
    }

    userData.connectivityElementSet.forEach((connectivityElement: any) => {
      if (connectivityElement.type === "Turn") {
        this.config.turnServers.push({
          credential: connectivityElement.restCredentials.credential,
          urls: `${connectivityElement.type.toLowerCase()}${connectivityElement.host}:${connectivityElement.port}?transport=${connectivityElement.transport.toLowerCase()}`,
          username: connectivityElement.restCredentials.username,
        });
      } else {
        this.config.stunServers.push({
          urls: `${connectivityElement.type.toLowerCase()}${connectivityElement.host}:${connectivityElement.port}?transport=${connectivityElement.transport.toLowerCase()}`,
        });
      }
    });
  }
}
