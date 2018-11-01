import {StateMachine} from "./stateMachine";

export class YayFonCall {

  private readonly currentSession: any;
  private readonly callDirection: string;
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
   * Returns id of current session
   * @public
   * @returns session id
   */
  public getSessionId(): string {
    return this.currentSession.id;
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
  public mute(): void {
    this.currentSession.mute();
  }

  /**
   * Unmutes the local audio and/or video
   * @public
   */
  public unmute(): void {
    this.currentSession.unmute();
  }

  /**
   * Transfers the caller to another agent without speaking to the new agent first
   * @param {string} phoneNumber - destination of the call
   * @public
   */

  public blindTransfer(phoneNumber: string): void {
    this.stateMachine.blindTransfer();
    this.currentSession.refer(`sip:${phoneNumber}@wss.yayfon.com`);
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
   * Answer the incoming session. Available only for incoming call
   * @public
   */
  public answer(): void {
    this.stateMachine.answer();
    this.currentSession.accept();
  }

  /**
   * Fired when an established call ends
   * @param {(event: object) => void} callback
   * @public
   */
  public onEnd(callback: (event: object) => void) {
    this.currentSession.on("terminated", (event: object) => {
      if (this.stateMachine.getState() !== "waiting") {
        this.stateMachine.onEnd();
      }
      callback(event);
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
   * Fired when the request fails, whether due to an unsuccessful final response or due to timeout, transport, or other
   * @param {(event: object) => void} callback
   * @public
   */
  public onFail(callback: (e: object, cause: string) => void) {
    this.currentSession.on("failed", (e: object, cause: string) => {
      this.stateMachine.onFail();
      callback(e, cause);
    });
  }
}
