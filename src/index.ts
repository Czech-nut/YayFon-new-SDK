import * as SIP from "sip.js";
import {Promise} from "../node_modules/es6-promise/dist/es6-promise.js";
import {ServerConfig} from "./models/ServerConfig";
import {UrlConstants} from "./models/urlConstants";
import {User} from "./models/User";
import {RequestService} from "./requestService";
import {StateMachine} from "./stateMachine/stateMachine";
import {YayFonCall} from "./YayFonCall";

// TODO: create the interfaces to get the missed and "any" types
// TODO: all the public methods should go into README.md with descriptions

class YayFonNewSdk {
  private readonly stateMachine: StateMachine;
  private readonly incomingCall: (call: YayFonCall) => void;
  private userAgent: any;
  private userData: User;
  private serverConfig: ServerConfig = new ServerConfig("wss.yayfon.com", "443");
  private agentCallId: string = "";
  private attendedAgentCallId: string = "";
  private calls: any = {};
  private api: UrlConstants = new UrlConstants();
  private requests: RequestService;

  /**
   *
   * @param uaConfig - object with user data and callback
   */
  constructor(uaConfig: any) {
    this.stateMachine = new StateMachine();
    this.userData = uaConfig.userData;
    this.requests = new RequestService(this.userData);
    this.setUserAgent(uaConfig.userData);
    this.incomingCall = uaConfig.callback;
  }

  /**
   * Returns info about current call
   * @param {string} callId
   * @public
   * @returns {YayFonCall}
   */
  public getCallInfo(callId: string): YayFonCall {
    return this.calls[callId];
  }

  /**
   * Returns current call id
   * @public
   * @returns {string} id of current call
   */
  public getAgentCallId(): string {
    return this.agentCallId;
  }

  /**
   * Returns id of call with second agent after attended transfer
   * @public
   * @returns {string} id of call with second agent
   */
  public getAttendedAgentCallId(): string {
    return this.attendedAgentCallId;
  }

  /**
   * Makes an outgoing multimedia call
   * @public
   * @param {string} phoneNumber - destination of the call
   */
  public call(phoneNumber: string): void {
    this.stateMachine.call();

    const options = { // TODO: can be created as class
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false,
        },
      },
    };
    const session = this.userAgent.invite(`sip:${phoneNumber}@${this.serverConfig.serverHost}`, options);
    const call = new YayFonCall(session, "outgoing", this.stateMachine);

    if (!this.getCallInfo(this.getAgentCallId())) {
      this.addSessionId(call);
    }
    session.on("failed", () => {
      this.clearSession(call);
    });
    session.on("terminated", () => {
      this.clearSession(call);
    });
    session.on("rejected", () => {
      this.clearSession(call);
    });
    session.on("canceled", () => {
      this.clearSession(call);
    });
    this.incomingCall(call);
  }

  /**
   * Declines all calls and cleans object with all information about calls
   * @public
   */
  public endCall(): void {
    const isMyObjectEmpty: boolean = !Object.keys(this.calls).length;
    if (isMyObjectEmpty) {
      this.stateMachine.decline();
    } else {
      for (const sessionId in this.calls) {
        const call = this.calls[sessionId];
        if (call) {
          call.endCall(); // TODO: should state machine be involved in that case as well?
        }
      }
      this.calls = {};
    }
  }
// TODO: the line below "Transfer where before actually transferring to the destination" doesn't make much sense
  /**
   * Transfer where before actually transferring to the destination,
   * the call is put on hold and another call is initiated to confirm whether the end destination
   * actually wants to take the call or not. These two calls can be merged together later.
   * @param {YayFonCall} agent - object with info about current call
   * @param {string} phoneNumber - destination of the call
   * @public
   */
  public attendedTransfer(agent: YayFonCall, phoneNumber: string): void {
    agent.hold(); // TODO: should state machine be involved?
    const attendedSession = this.call(phoneNumber);
    const attendedCall = new YayFonCall(attendedSession, "outgoing", this.stateMachine);
    const attendedSessionId = attendedCall.getSessionId();
    this.calls[attendedSessionId] = attendedCall;
    this.attendedAgentCallId = attendedSessionId;
  }

  /**
   * Declines only the person to whom the transfer was made
   * @public
   */
  public endAttendedCall(): void {// TODO: should state machine be involved?
    this.getCallInfo(this.getAttendedAgentCallId()).endCall();
    this.getCallInfo(this.getAgentCallId()).unhold();
  }
// TODO: line below "and declines us" - not clear
  /**
   * Connects two agents after attended transfer and declines us
   * @public
   */
  public confirmTransfer(): void {// TODO: should state machine be involved?
    const callInfo: YayFonCall = this.getCallInfo(this.getAgentCallId());
    const attendedCallInfo = this.getCallInfo(this.getAttendedAgentCallId());
    if (callInfo) {
      callInfo.unhold();
      callInfo.getSession().refer(attendedCallInfo.getSession());
    }
  }

  /**
   * Fired for successful registration
   * @param callback
   * @public
   */
  public onRegister(callback: any) {
    this.userAgent.on("registered", () => {
      callback();
    });
  }

  /**
   * Fired for registration failure
   * @param callback
   * @public
   */
  public onRegistrationFailed(callback: any) {
    this.userAgent.on("registrationFailed", () => {
      callback();
    });
  }

  /**
   * Fired for unregistration
   * @param callback
   * @public
   */
  public onUnregistered(callback: any) {
    this.userAgent.on("unregistered", () => {
      callback();
    });
  }

  /**
   * Disconnects from the WebSocket server after gracefully unregistering and terminates any active sessions
   * @public
   */
  public logout(): void {
    this.requests.setOfflineStatus()
      .then(() => {
        this.userAgent.stop();
      });
  }

  /**
   * Sets current user agent
   * @param {User} userData
   * @private
   */
  private setUserAgent(userData: User): void {
    if (userData.token) {
      this.requests.setOnlineStatus(userData.token)
        .then((response: User) => {
          this.start(response);
        });
    } else if (userData.password) {
      this.requests.getToken(userData)
        .then((token: string) => {
          this.requests.setOnlineStatus(token.toString())
            .then((response: User) => {
              this.start(response);
            });
        });
    } else if (!userData.password) {
      this.requests.getWidgetInfo(userData)
        .then((response: User) => {
          this.start(response);
        });
    }
  }

  /**
   * Connects to the configured WebSocket server
   * @param {User} userData
   * @private
   */
  private start(userData: any) { // TODO: method name can be more clealer, like startConnection or initiateConnection
    this.setOptions(userData)
      .then((config: any) => {
        this.userAgent = new SIP.UA(config);
        this.userAgent.start();
        this.onIncomingCall();
      });
  }

  /**
   * Clears session
   * @param {YayFonCall} call
   * @private
   */
  private clearSession(call: YayFonCall) {
    const sessionId = call.getSessionId();
    this.calls[sessionId] = null;
    if (sessionId === this.agentCallId) {
      this.agentCallId = "";
    } else if (sessionId === this.attendedAgentCallId) {
      this.attendedAgentCallId = "";
    }
  }

  /**
   * Adds session id to objects with all current calls
   * @param {YayFonCall} call
   * @private
   */
  private addSessionId(call: YayFonCall) {
    this.agentCallId = call.getSessionId();
    this.calls[this.agentCallId] = call;
  }

  /**
   * Sets options for user agent
   * @param userData
   * @private
   * @returns Promise - resolve when all params for configuration will set up
   */
  private setOptions(userData: any) {
    return new Promise((resolve: any) => {
      this.userData = userData;
      let config: any; // TODO: create interface or class
      config = {
        log: {
          builtinEnabled: false,
        },
        stunServers: [],
        traceSip: true,
        transportOptions: {
          wsServers: [this.api.server],
        },
        turnServers: [],
        uri: `${this.userData.username}@${this.serverConfig.serverHost}`,
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
            urls: `${connectivityElement.type.toLowerCase()}${connectivityElement.host}:${connectivityElement.port}?transport=${connectivityElement.transport.toLowerCase()}`,
            username: connectivityElement.restCredentials.username,
          });
        } else {
          config.stunServers.push({
            urls: `${connectivityElement.type.toLowerCase()}${connectivityElement.host}:${connectivityElement.port}?transport=${connectivityElement.transport.toLowerCase()}`,
          });
        }
      });

      resolve(config);
    });
  }

  /**
   * Fired when an incoming request is received.
   * @private
   */
  private onIncomingCall() {
    this.userAgent.on("invite", (session: any) => {
      const call = new YayFonCall(session, "incoming", this.stateMachine);

      if (this.agentCallId) {
        session.terminate({
          reason_phrase: "Busy Here",
          status_code: 486,
        });
      } else {
        this.agentCallId = call.getSessionId();
        this.calls[this.agentCallId] = call;
        this.incomingCall(call);
      }
    });
  }
}

module.exports = YayFonNewSdk;
exports = YayFonNewSdk;
