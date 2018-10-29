export class YayFonCall {

  private readonly currentSession: any;
  private readonly callDirection: string;

  constructor(session: any, callDirection: string) {
    this.currentSession = session;
    this.callDirection = callDirection;
  }

  public getSessionId(): string {
    return this.currentSession.id;
  }

  public endCall(): void {
    if (this.currentSession) {
      if (this.currentSession.connection) {
        this.currentSession.connection.close();
      }
      this.currentSession.terminate();
    }
  }

  public getSession(): any {
    return this.currentSession;
  }

  public hold(): void {
    this.currentSession.hold();
  }

  public unhold(): void {
    this.currentSession.unhold();
  }

  public mute(): void {
    this.currentSession.mute();
  }

  public unmute(): void {
    this.currentSession.unmute();
  }

  public blindTransfer(phoneNumber: string): void {
    this.currentSession.refer(`sip:${phoneNumber}@wss.yayfon.com`);
  }

  public isIncomingCall(): boolean {
    return this.currentSession && this.callDirection === "incoming";
  }

  public answer(): void {
    this.currentSession.accept();
  }

  public onEnd(callback: (event: object) => void) {
    this.currentSession.on("terminated", (event: object) => {
      callback(event);
    });
  }

  public onSend(callback: () => void) {
    this.currentSession.on("invite", () => {
      callback();
    });
  }

  public onProgress(callback: () => void) {
    this.currentSession.on("progress", () => {
      callback();
    });
  }

  public onConnecting(callback: () => void) {
    this.currentSession.on("progress", () => {
      callback();
    });
  }

  public onAccept(callback: (pc: object) => void) {
    this.currentSession.on("accepted", () => {
      const pc = this.currentSession.sessionDescriptionHandler.peerConnection;
      callback(pc);
    });
  }

  public onFail(callback: (e: object, cause: string) => void) {
    this.currentSession.on("failed", (e: object, cause: string) => {
      callback(e, cause);
    });
  }
}
