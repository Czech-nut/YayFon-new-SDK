// import { StateMachine } from "@taoqf/javascript-state-machine"; TODO: try to import as typescript module
const StateMachineConstructor = require('javascript-state-machine');


export class StateMachine {
  stateMachineSettings = { //TODO: put the stateMachine settings into separate module
    init: 'empty',
    transitions: [ //TODO: add all the proper states, probably we have to hae multiple state machines for each user: for the current calls and incoming calls
      {name: 'answer', from: 'onCall', to: 'inCall'},
      {name: 'decline', from: 'onCall', to: 'empty'},
      {name: 'end', from: 'onCall', to: 'empty'},
      {name: 'hold', from: 'onCall', to: 'onHold'},
      {name: 'unhold', from: 'onHold', to: 'onCall'},
      {name: 'blindTransfer', from: 'onCall', to: 'empty'},
      {name: 'mute', from: 'empty', to: 'onCall'},
      {name: 'unmute', from: 'empty', to: 'onCall'}
    ],
    methods: { //TODO: put the needed event handlers
      onEnd: function () {
        console.log('its onEnd');
      },
      onRejected: function  () {
        console.log('its onRejected');
      },
      onCancel: function  () {
        console.log('its onCancel');
      },
      onReinvite: function  () {
        console.log('its onReinvite');
      },
      onReferRequested: function  () {
        console.log('its onReferRequested');
      },
      onReplaced: function  () {
        console.log('its onReplaced');
      },
      onDTMF: function  () {
        console.log('its onDTMF');
      },
      onDirectionChanged: function  () {
        console.log('its onDirectionChanged');
      },
      onTrackAdded: function  () {
        console.log('its onTrackAdded');
      },
      onBye: function  () {
        console.log('its onBye');
      },
      onProgress: function  () {
        console.log('its onProgress');
      },
      onFail: function  () {
        console.log('its onFail');
      },
      onAnswer: function  () {
        console.log('its onAnswer')
      },
    }
  };
  stateMachine = new StateMachineConstructor(this.stateMachineSettings); // TODO: import proper type

  constructor() { }

  answer () {
    this.stateMachine.answer();
  }
  decline () {
    this.stateMachine.decline();
  }
  end () {
    this.stateMachine.end();
  }
  hold () {
    this.stateMachine.hold();
  }
  unhold () {
    this.stateMachine.unhold();
  }
  blindTransfer () {
    this.stateMachine.blindTransfer();
  }
  mute () {
    this.stateMachine.mute();
  }
  unmute () {
    this.stateMachine.unmute();
  }
}


