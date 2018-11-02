import * as SIP from "sip.js";
import {Promise} from "../node_modules/es6-promise/dist/es6-promise.js";
import {ConfigurationOptions} from "./models/configurationOptions";
import {UrlConstants} from "./models/urlConstants";
import {User} from "./models/User";
import {RequestService} from "./requestService";
import {StateMachine} from "./stateMachine/stateMachine";
import {YayFonCall} from "./YayFonCall";

interface ICalls {
  [key: string]: YayFonCall | null;
}

class YayFonSdk {
  private readonly stateMachine: StateMachine;
  private readonly incomingCall: (call: YayFonCall) => void;
  private userAgent: SIP.UA = new SIP.UA({
    log: {
      builtinEnabled: false,
    },
  });
  private userData: User;
  private readonly urls: UrlConstants = new UrlConstants();
  private agentCallId: string = "";
  private attendedAgentCallId: string = "";
  private calls: ICalls = {};
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
  public getCallInfo(callId: string): YayFonCall | null {
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
    const options: any = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: false,
        },
      },
    };
    const target: string = `sip:${phoneNumber}@${this.urls.serverHost}`;
    const session = this.userAgent.invite(target, options);
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
    this.stateMachine.decline();
    for (const sessionId in this.calls) {
      if (this.calls[sessionId]) {
        this.calls[sessionId]!.endCall();
      }
    }
    this.calls = {};
  }

  /**
   * The current call is put on hold and another call is initiated to confirm whether the end destination
   * actually wants to take the call or not.
   * @param {YayFonCall} agent - object with info about current call
   * @param {string} phoneNumber - destination of the call
   * @public
   */
  public attendedTransfer(agent: YayFonCall, phoneNumber: string): void {
    this.stateMachine.attendedTransfer();
    agent.hold();
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
  public endAttendedCall(): void {
    this.stateMachine.declineAttendedTransfer();
    this.getCallInfo(this.getAttendedAgentCallId())!.endCall();
    this.getCallInfo(this.getAgentCallId())!.unhold();
  }

  /**
   * Connects two agents after attended transfer and terminates current call
   * @public
   */
  public confirmTransfer(): void {
    this.stateMachine.confirmTransfer();
    const callInfo: YayFonCall | null = this.getCallInfo(this.getAgentCallId());
    const attendedCallInfo = this.getCallInfo(this.getAttendedAgentCallId());
    if (callInfo) {
      callInfo.unhold();
      callInfo.getSession().refer(attendedCallInfo!.getSession());
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
          this.startConnection(response);
        });
    } else if (userData.password) {
      this.requests.getToken(userData)
        .then((token: string) => {
          this.requests.setOnlineStatus(token.toString())
            .then((response: User) => {
              this.startConnection(response);
            });
        });
    } else if (!userData.password) {
      this.requests.getWidgetInfo(userData)
        .then((response: User) => {
          this.startConnection(response);
        });
    }
  }

  /**
   * Connects to the configured WebSocket server
   * @param {User} userData
   * @private
   */
  private startConnection(userData: any) {
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
      const config: ConfigurationOptions = new ConfigurationOptions(this.userData);
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

module.exports = YayFonSdk;
exports = YayFonSdk;
