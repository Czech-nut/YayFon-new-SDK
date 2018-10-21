import { StateMachine } from './stateMachine';
import * as sipjs from 'sip.js';

//TODO: put the TSDOC documentation

export class YayFonNewSdk {
  stateMachine: any; //TODO: add proper type
  SIP: any;//TODO: add proper type

  constructor(clientData: any){
    this.stateMachine = new StateMachine();   // State machine is used to control the state of the calls at every moment.
    this.SIP = new sipjs.UA();
  }


  call(){
    let uaInstance = this.SIP();
  }
  start(){}
  endCall(){}
  end(){}
  getState(){} // TODO: here State Machine comes to play exposing the state to the SDK user. User can get the state but never change directly.


  // each of the SDK methods should work state via State Machine
  // think of pros and cons if the SIP methods should be called from the sdk itself(current file) or from the State machine file.
}

