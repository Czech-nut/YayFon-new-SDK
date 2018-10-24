import { StateMachine } from "./stateMachine";
import { Promise } from "es6-promise";
import { User } from "./models/User";
// import * as SIP from "sip.js";
import { ServerConfig } from "./models/ServerConfig";

// TODO: put the TSDOC documentation

class YayFonNewSdk {
  private stateMachine: any; // TODO: add proper type
  private SIP: any; // TODO: add proper type
  private userData: User;
  private serverConfig: ServerConfig = new ServerConfig("wss.yayfon.com", "443");

  constructor(clientData: User) {
    console.log('test');
    this.stateMachine = new StateMachine(); // State machine is used to control the state of the calls at every moment.
    this.userData = clientData;
   /* this.getAuthData(clientData)
      .then((response: User) => {
        return this.setOptions(response)
          .then((config: any) => {
            this.SIP = new SIP.UA(config);
          });
      });*/
  }

  public call() {
    console.log("call");
  }
  public start() {
    console.log("start");
  }
  public endCall() {
    console.log("endCall");
  }
  public end() {
    console.log("end");
  }
  public getState() {
    // TODO: here State Machine comes to play exposing the state to the SDK user.
    // User can get the state but never change directly.
    console.log("getState");
  }

  public getAuthData(userData: User): Promise<User> {
    return new Promise((resolve: any, reject: any) => {
      if (userData.token) {
        const httpForAuth = new XMLHttpRequest();
        httpForAuth.open("POST", "https://api.yayfon.com/v2.0/console/account/online", true);
        httpForAuth.setRequestHeader("Content-Type", "application/json");
        httpForAuth.setRequestHeader("Authoriation", "Bearer " + userData.token);
        httpForAuth.send(JSON.stringify({
          destination: localStorage.getItem("yayFonToken"),
          pushPlatform: "CHROME",
        }));
        httpForAuth.onreadystatechange = () => {
          if (httpForAuth.readyState === XMLHttpRequest.DONE && httpForAuth.status === 200) {
            this.userData = JSON.parse(httpForAuth.responseText);
            resolve(this.userData);
          }
        };
      } else if (!userData.password) {
        const httpForAuth = new XMLHttpRequest();
        httpForAuth.open("GET", "https://api.yayfon.com/v2.0/widget/caller-settings/" + userData.username, true);
        httpForAuth.send(null);
        httpForAuth.onreadystatechange = () => {
          if (httpForAuth.readyState === XMLHttpRequest.DONE && httpForAuth.status === 200) {
            this.userData = {
              authKey: "",
              connectivityElementSet: JSON.parse(httpForAuth.responseText).connectivityElementSet,
              displayName: "",
              password: "",
              token: "",
              username: JSON.parse(httpForAuth.responseText).from,
            };
            resolve(this.userData);
          }
        };
      } else if (userData.password) {
        const httpForToken = new XMLHttpRequest();
        const json = JSON.stringify({
          password: userData.password,
          username: userData.username,
        });
        httpForToken.open("POST", "https://api.yayfon.com/v2.0/sso/login", true);
        httpForToken.setRequestHeader("Content-type", "application/json; charset=utf-8");
        httpForToken.onreadystatechange = () => {
          if (httpForToken.readyState === XMLHttpRequest.DONE && httpForToken.status === 200) {
            localStorage.setItem("yayFonToken", JSON.parse(httpForToken.responseText).token);
          }
        };
        httpForToken.send(json);
        const httpForAuth = new XMLHttpRequest();
        httpForAuth.open("POST", "https://api.yayfon.com/v2.0/console/account/online", true);
        httpForAuth.setRequestHeader("Content-Type", "application/json");
        httpForAuth.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("yayFonToken"));
        httpForAuth.send(JSON.stringify({
          destination: localStorage.getItem("yayFonToken"),
          pushPlatform: "CHROME",
        }));
        httpForAuth.onreadystatechange = () => {
          if (httpForAuth.readyState === XMLHttpRequest.DONE && httpForAuth.status === 200) {
            this.userData = JSON.parse(httpForAuth.responseText);
            resolve(this.userData);
          }
        };
      }
    });
  }

  private setOptions(userData: User) {
    return new Promise((resolve: any, reject: any) => {
      this.userData = userData;
      let config: any;
      config = {
        log: {
          builtinEnabled: false,
        },
        stunServers: [],
        traceSip: true,
        transportOptions: {
          wsServers: ["wss://wss.yayfon.com"],
        },
        turnServers: [],
        uri: this.userData.username + "@" + this.serverConfig.serverHost,
      };
      if (userData.authKey) {
        config.password = userData.authKey;
        config.authorizationUser = userData.username;
        config.register = true;
      } else {
        config.register = false;
      }
      userData.connectivityElementSet.forEach((connectivityElement: any) => {
        if (connectivityElement.type === "Turn") {
          config.turnServers.push({
            credential: connectivityElement.restCredentials.credential,
            urls: connectivityElement.type.toLowerCase() + connectivityElement.host + ":" + connectivityElement.port + "?transport=" + connectivityElement.transport.toLowerCase(),
            username: connectivityElement.restCredentials.username,
          });
        } else {
          config.stunServers.push({
            urls: connectivityElement.type.toLowerCase() + connectivityElement.host + ":" + connectivityElement.port + "?transport=" + connectivityElement.transport.toLowerCase(),
          });
        }
      });
      resolve(config);
    });
  }

  // each of the SDK methods should work state via State Machine
  // think of pros and cons if the SIP methods should be called from the sdk itself(current file)
  // or from the State machine file.
}

module.exports = YayFonNewSdk;
exports = YayFonNewSdk;
