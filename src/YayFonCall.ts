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

  public end(): void {
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

  public blindTransfer(phoneNumber: string): void {
    this.currentSession.refer("sip:" + phoneNumber + "@wss.yayfon.com");
  }

  public isIncomingCall(): boolean {
    return this.currentSession && this.callDirection === "incoming";
  }

  public answer(): void {
    this.currentSession.accept();
  }
}
