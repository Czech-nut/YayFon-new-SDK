import * as SIP from "sip.js";
import { XMLHttpRequest } from "xmlhttprequest-ts";
import { Promise } from "../node_modules/es6-promise/dist/es6-promise.js";
import { ServerConfig } from "./models/ServerConfig";
import { User } from "./models/User";
import { StateMachine } from "./stateMachine";
import { YayFonCall } from "./YayFonCall";

// TODO: put the TSDOC documentation
// TODO: create the interfaces to get the types
// TODO: Everywhere when a user interacts with the call a state in statemachine has to be changed.
// we can start in easy steps:
// 1) define the states that a user can have (like on call, on hold, no call etc.)
// 2) create these states in state machine
// 3) define what is the flow of changing the sates (like no cal can't change to on hold etc.)
// 4) every SDK method that interacts with the call has to take in consideration the current state and change it if needed

class YayFonNewSdk {
  private stateMachine: any; // TODO: add proper type
  private userAgent: any; // TODO: add proper type
  private userData: User;
  private serverConfig: ServerConfig = new ServerConfig("wss.yayfon.com", "443");
  private agentCallId: string = "";
  private attendedAgentCallId: string = "";
  private calls: any = {};
  private readonly incomingCall: (call: YayFonCall) => void;

  constructor(uaConfig: any) {
    this.stateMachine = new StateMachine(); // State machine is used to control the state of the calls at every moment.
    this.userData = uaConfig.userData;
    this.setUserAgent(uaConfig.userData);
    this.incomingCall = uaConfig.callback;
  }

  public setUserAgent(userData: User): void {
      if (userData.token) {
        this.setOnlineStatus(userData.token)
          .then((response: User) => {// TODO: this callback repeats 3 times, it can go into separate function instead
            this.setOptions(response)
              .then((config: any) => {
                this.userAgent = new SIP.UA(config);
                this.userAgent.start();
                this.onIncomingCall();
              });
          });
      } else if (!userData.password) {// TODO: usually true statement described first
        this.getWidgetInfo(userData)
          .then((response: User) => {// TODO: this callback repeats 3 times, it can go into separate function instead
            this.setOptions(response)
              .then((config: any) => {
                this.userAgent = new SIP.UA(config);
                this.userAgent.start();
                this.onIncomingCall();
              });
          });
      } else if (userData.password) {
        this.getToken(userData)
          .then((token: string) => {// TODO: this callback repeats 3 times, it can go into separate function instead
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

  // TODO: Herer and in other places: has to be refactored to have a pure functions in all the places where it is possible to have (http://www.nicoespeon.com/en/2015/01/pure-functions-javascript/)
  // the reason is that impure functions are unpredictable. The function below can return different values for the same call every time because it is dependent on external values.
  // to refactor that function it should take take caller id as an argument instead of being dependent on it outside it's scope
  public attendedAgentCall(): YayFonCall { // TODO: here and everywhere else: all the metheods sould be verbs. Here for example it should say getAttendedAgentCall
    return this.calls[this.attendedAgentCallId];
  }

  public agentCall(): YayFonCall { // TODO: like here method is not actually calling anyone like user can think. It only gets the call data
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
    const session = this.userAgent.invite("sip:" + phoneNumber + "@" + this.serverConfig.serverHost, options); // TODO: please use ES6 brackets `bla ${variable} bla` instead of summing up strings
    const call = new YayFonCall(session, "outgoing");
    if (!this.agentCall()) {
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
    this.incomingCall(call);
  }

  public end(): void { // TODO: "endCall" name wiLL give more info about the SDK method that has to be self-explanatory
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
    const session = this.call(phoneNumber); // TODO: is it a new session or an old session - variable should be named clearly
    const attendedCall = new YayFonCall(session, "outgoing");
    this.calls[attendedCall.getSessionId()] = attendedCall; // TODO: BETTER TO PUT attendedCall.getSessionId() in separate variable, same way how it's done 2 lines above
    this.attendedAgentCallId = attendedCall.getSessionId();
  }

  public endAttendedCall(): void {
    this.attendedAgentCall().end();
    this.agentCall().unhold();
  }

  public confirmTransfer(): void {
    if (this.agentCall()) {
      this.agentCall().unhold();
      this.agentCall().getSession().refer(this.attendedAgentCall().getSession());
    }
  }

  public onRegister(callback: any) {
    this.userAgent.on("registered", () => {
      callback();
    });
  }

  public onRegistrationFailed(callback: any) {
    this.userAgent.on("registrationFailed", () => {
      callback();
    });
  }

  public onUnregistered(callback: any) {
    this.userAgent.on("unregistered", () => {
      callback();
    });
  }

  public logout(): void {
    this.setOfflineStatus()
      .then(() => {
        this.userAgent.stop();
      });
  }

  private callEnd(call: YayFonCall) { // TODO: There is a a small riddle with the naming of functions: call, endCall, callEnd. But no callStart or startCall - please change the methods names so it would be clearer
    const sessionId = call.getSessionId();
    this.calls[sessionId] = null;
    if (sessionId === this.agentCallId) {
      this.agentCallId = "";
    }
    if (sessionId === this.attendedAgentCallId) { // TODO: else if instead of if
      this.attendedAgentCallId = "";
    }
  }

  private addSessionId(call: YayFonCall) {
    this.agentCallId = call.getSessionId();
    this.calls[this.agentCallId] = call;
  }

  // TODO: good idea to move all the logic of working with sessions/storages/requests into separate module (getToken, setOnlineStatus, setOfflineStatus, getWidgetInfo, setOptions)

  private getToken(userData: User) {
    return new Promise((resolve: any, reject: any) => {
      const httpForToken = new XMLHttpRequest();
      const json = JSON.stringify({ // TODO: variable name should show what is inside of it, instead of what type of data in it
        password: userData.password,
        username: userData.username,
      });
      httpForToken.open("POST", "https://api.yayfon.com/v2.0/sso/login", true); // TODO: here and everywhere: all the urls should come from environment variables instead of hardcoding them in the SDK
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
    return new Promise((resolve: any, reject: any) => { // TODO: if reject is not needed - remove it from attributes
      const httpForAuth = new XMLHttpRequest();
      httpForAuth.open("POST", "https://api.yayfon.com/v2.0/console/account/online", true);
      httpForAuth.setRequestHeader("Content-Type", "application/json");
      httpForAuth.setRequestHeader("Authorization", "Bearer " + token);
      httpForAuth.send(JSON.stringify({
        destination: token,
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

  private setOfflineStatus() {
    return new Promise((resolve: any, reject: any) => {
      const httpForLogout = new XMLHttpRequest();
      httpForLogout.open("POST", "https://api.yayfon.com/v2.0/console/account/offline", true);
      httpForLogout.setRequestHeader("Content-Type", "application/json");
      httpForLogout.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("yayFonToken"));
      httpForLogout.send(JSON.stringify({
        destination: this.localStorage.getItem("yayFonToken"),
        pushPlatform: "CHROME",
      }));
      httpForLogout.onreadystatechange = () => {
        if (httpForLogout.readyState === XMLHttpRequest.DONE && httpForLogout.status === 200) {
          localStorage.setItem("yayFonToken", "");
          resolve();
        }
      };
    });
  }

  private getWidgetInfo(userData: User) {
    return new Promise((resolve: any, reject: any) => {
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
      this.incomingCall(call);
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
