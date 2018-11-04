import {UrlConstants} from "./models/urlConstants";
import {StateMachine} from "./stateMachine/stateMachine";

export class YayFonCall {
  private readonly currentSession: any;
  private readonly callDirection: string;
  private readonly urls: UrlConstants = new UrlConstants();
  private stateMachine: StateMachine;

  /**
   *
   * @param session
   * @param {string} callDirection - this is argument, that takes one of the values - incoming or outgoing
   * @param {StateMachine} stateMachine - this is argument to control states
   */
  constructor(session: any, callDirection: string, stateMachine: StateMachine) {
    this.currentSession = session;
    this.callDirection = callDirection;
    this.stateMachine = stateMachine;
  }

  /**
   *
   * Returns info about current session
   * @public
   * @returns current session
   */
  public getSession(): any {
    return this.currentSession;
  }

  /**
   *
   * Returns id of current session
   * @public
   * @returns session id
   */
  public getSessionId(): string {
    return this.currentSession.id;
  }

  /**
   * Answer the incoming session. Available only for incoming call
   * @public
   */
  public answer(): void {
    this.stateMachine.answer();
    this.currentSession.accept();
  }

  /**
   *
   * Terminates current call
   * @public
   */
  public endCall(): void {
    if (this.currentSession) {
      if (this.currentSession.connection) {
        this.currentSession.connection.close();
      }
      this.currentSession.terminate();
    }
  }

  /**
   * Transfers the caller to another agent without speaking to the new agent first
   * @param {string} phoneNumber - destination of the call
   * @public
   */
  public blindTransfer(phoneNumber: string): void {
    this.stateMachine.blindTransfer();
    const target: string = `sip:${phoneNumber}${this.urls.serverHost}`;
    this.currentSession.refer(target);
  }

  /**
   *
   * Puts the call on hold
   * @public
   */
  public hold(): void {
    this.currentSession.hold();
  }

  /**
   * Resumes the call from hold
   * @public
   */
  public unhold(): void {
    this.currentSession.unhold();
  }

  /**
   * Mutes the local audio and/or video
   * @public
   */
  public mute(mute: boolean): void {
    const pc = this.currentSession.sessionDescriptionHandler.peerConnection;

    if (pc.getSenders) {
      const senders = pc.getSenders();
      senders.forEach((sender: any) => {
        if (sender.track) {
          sender.track.enabled = !mute;
        }
      });
    } else {
      pc.getLocalStreams().forEach((stream: any) => {
        stream.getAudioTracks().forEach((track: any) => {
          track.enabled = !mute;
        });
        stream.getVideoTracks().forEach((track: any) => {
          track.enabled = !mute;
        });
      });
    }
  }

  /**
   * Unmutes the local audio and/or video
   * @public
   */
  public unmute(): void {
    this.mute(false);
  }

  /**
   *
   * Determines if the call is incoming
   * @public
   * @returns {boolean}
   */
  public isIncomingCall(): boolean {
    return this.currentSession && this.callDirection === "incoming";
  }

  /**
   * Fired each time a successful final (200-299) response is received
   * @param {(event: object) => void} callback
   * @public
   */
  public onAccept(callback: (pc: object) => void) {
    this.currentSession.on("accepted", () => {
      this.stateMachine.onAccept();
      const pc = this.currentSession.sessionDescriptionHandler.peerConnection;
      callback(pc);
    });
  }

  /**
   * Fired each time a provisional response is received
   * @param {(event: object) => void} callback
   * @public
   */
  public onProgress(callback: () => void) {
    this.currentSession.on("progress", () => {
      callback();
    });
  }

  /**
   * Fired when an established call ends
   * @param {(event: object) => void} callback
   * @public
   */
  public onEnd(callback: (event: object) => void) {
    this.currentSession.on("terminated", (event: object) => {
      const state: string = this.stateMachine.getState();
      if (state === "calling" || state === "talking") {
        this.stateMachine.onEnd();
      } else if (state === "talkingAttendedTransfer" || state === "callingAttendedTransfer") {
        this.stateMachine.onEndAttendedTransfer();
      }
      callback(event);
    });
  }

  /**
   * Fired when the request fails, whether due to an unsuccessful final response or due to timeout, transport, or other
   * @param {(event: object) => void} callback
   * @public
   */
  public onFail(callback: (e: object, cause: string) => void) {
    this.currentSession.on("failed", (e: object, cause: string) => {
      const state: string = this.stateMachine.getState();
      if (state === "calling" || state === "talking") {
        this.stateMachine.onFail();
      } else if (state === "talkingAttendedTransfer" || state === "callingAttendedTransfer") {
        this.stateMachine.onFailAttendedTransfer();
      }
      callback(e, cause);
    });
  }
}
