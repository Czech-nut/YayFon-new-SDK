import * as SIP from "sip.js";
import { Promise } from "../node_modules/es6-promise/dist/es6-promise.js";
import { ServerConfig } from "./models/ServerConfig";
import { User } from "./models/User";
import { StateMachine } from "./stateMachine";
import {YayFonCall} from "./YayFonCall";

// TODO: put the TSDOC documentation

class YayFonNewSdk {
  private stateMachine: any; // TODO: add proper type
  private userAgent: any; // TODO: add proper type
  private userData: User;
  private serverConfig: ServerConfig = new ServerConfig("wss.yayfon.com", "443");
  private agentCallId: string = "";
  private attendedAgentCallId: string = "";
  private calls: any = {};

  constructor(clientData: User) {
    this.stateMachine = new StateMachine(); // State machine is used to control the state of the calls at every moment.
    this.userData = clientData;
    this.setUserAgent(clientData);
  }

  public setUserAgent(userData: User): void {
      if (userData.token) {
        this.setOnlineStatus(userData.token)
          .then((response: User) => {
            this.setOptions(response)
              .then((config: any) => {
                this.userAgent = new SIP.UA(config);
                this.userAgent.start();
                this.onIncomingCall();
              });
          });
      } else if (!userData.password) {
        this.getWidgetInfo(userData)
          .then((response: User) => {
            this.setOptions(response)
              .then((config: any) => {
                this.userAgent = new SIP.UA(config);
                this.userAgent.start();
                this.onIncomingCall();
              });
          });
      } else if (userData.password) {
        this.getToken(userData)
          .then((token: string) => {
            this.setOnlineStatus(token.toString())
              .then((response: User) => {
                this.setOptions(response)
                  .then((config: any) => {
                    this.userAgent = new SIP.UA(config);
                    this.userAgent.start();
                    this.onIncomingCall();
                  });
              });
          });
      }
  }

  public get attendedAgentCall(): YayFonCall {
    return this.calls[this.attendedAgentCallId];
  }
  public get agentCall(): YayFonCall {
    return this.calls[this.agentCallId];
  }

  public call(phoneNumber: string): void {
    const options = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false,
        },
      },
    };
    const session = this.userAgent.invite("sip:" + phoneNumber + "@" + this.serverConfig.serverHost, options);
    const call = new YayFonCall(session, "outgoing");
    if (!this.agentCall) {
      this.addSessionId(call);
    }
    session.on("failed", () => {
      this.callEnd(call);
    });
    session.on("terminated", () => {
      this.callEnd(call);
    });
    session.on("rejected", () => {
      this.callEnd(call);
    });
    session.on("canceled", () => {
      this.callEnd(call);
    });
  }

  public end(): void {
    for (const sessionId in this.calls) {
      const call = this.calls[sessionId];
      if (call) {
        call.end();
      }
    }
    this.calls = {};
  }

  public attendedTransfer(agent: YayFonCall, phoneNumber: string): void {
    agent.hold();
    const session = this.call(phoneNumber);
    const attendedCall = new YayFonCall(session, "outgoing");
    this.calls[attendedCall.getSessionId()] = attendedCall;
    this.attendedAgentCallId = attendedCall.getSessionId();
  }

  public endAttendedCall(): void {
    this.attendedAgentCall.end();
    this.agentCall.unhold();
  }
  public confirmTransfer(): void {
    if (this.agentCall) {
      this.agentCall.unhold();
      this.agentCall.getSession().refer(this.attendedAgentCall.getSession());
    }
  }

  private callEnd(call: YayFonCall) {
    const sessionId = call.getSessionId();
    this.calls[sessionId] = null;
    if (sessionId === this.agentCallId) {
      this.agentCallId = "";
    }
    if (sessionId === this.attendedAgentCallId) {
      this.attendedAgentCallId = "";
    }
  }

  private addSessionId(call: YayFonCall) {
    this.agentCallId = call.getSessionId();
    this.calls[this.agentCallId] = call;
  }

  private getToken(userData: User) {
    return new Promise((resolve, reject) => {
      const httpForToken = new XMLHttpRequest();
      const json = JSON.stringify({
        password: userData.password,
        username: userData.username,
      });
      httpForToken.open("POST", "https://api.yayfon.com/v2.0/sso/login", true);
      httpForToken.setRequestHeader("Content-type", "application/json; charset=utf-8");
      httpForToken.onreadystatechange = () => {
        if (httpForToken.readyState === XMLHttpRequest.DONE && httpForToken.status === 200) {
          const token: string = JSON.parse(httpForToken.responseText).token;
          localStorage.setItem("yayFonToken", token);
          resolve(token);
        }
      };
      httpForToken.send(json);
    });
  }

  private setOnlineStatus(token: string) {
    return new Promise((resolve, reject) => {
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
    });
  }

  private getWidgetInfo(userData: User) {
    return new Promise((resolve, reject) => {
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
    });
  }

  private setOptions(userData: any) {
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
            urls: connectivityElement.type.toLowerCase() + connectivityElement.host + ":"
              + connectivityElement.port + "?transport=" + connectivityElement.transport.toLowerCase(),
            username: connectivityElement.restCredentials.username,
          });
        } else {
          config.stunServers.push({
            urls: connectivityElement.type.toLowerCase() + connectivityElement.host + ":"
              + connectivityElement.port + "?transport=" + connectivityElement.transport.toLowerCase(),
          });
        }
      });
      resolve(config);
    });
  }

  private onIncomingCall() {
    this.userAgent.on("invite", (session: any) => {
      const call = new YayFonCall(session, "incoming");
      if (this.agentCallId) {
        session.terminate({
          reason_phrase: "Busy Here",
          status_code: 486,
        });
        return;
      } else {
        this.agentCallId = call.getSessionId();
        this.calls[this.agentCallId] = call;
      }
    });
  }

  private getState() {
    this.stateMachine = this.stateMachine;
  }             // TODO: here State Machine comes to play exposing the state to the SDK user.
                // User can get the state but never change directly.

  // each of the SDK methods should work state via State Machine
  // think of pros and cons if the SIP methods should be called from the sdk itself(current file)
  // or from the State machine file.
}

module.exports = YayFonNewSdk;
exports = YayFonNewSdk;
