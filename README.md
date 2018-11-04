# YayFon-js-SDK
Sip.js-based JavaScript library that helps developers make applications for online calls.

YayFon-js-SDK features:
- Audio and Video calls support
- Uses State Machine
- Blind and Attended transfers

Get the SDK package:

    $ npm i @yayfon/yayfon-js-sdk


# Usage

Example with login and bundled SDK can be found in "example" folder.

To start example run:

    $ npm i
    $ npm run build 


# API

### YayFonSdk
Class for init connection, make calls, attended transfer and confirm transfer

##### getCallInfo()
Returns info about current call

##### getAgentCallId()
Returns current call id

##### getAttendedAgentCallId()
Returns id of call with second agent after attended transfer

##### call(phoneNumber)
Makes an outgoing multimedia call
*phoneNumber* - destination of the call

##### endCall()
Declines all calls and cleans object with all information about calls

##### attendedTransfer(agent, phoneNumber)
The current call is put on hold and another call is initiated to confirm whether the end destination
actually wants to take the call or not
*agent* - object with info about current call (YayFonCall)
*phoneNumber* - destination of the call

##### endAttendedCall()
Declines only the person to whom the transfer was made

##### confirmTransfer()
Connects two agents after attended transfer and terminates current call

##### onRegister(callback)
Fired for successful registration
*callback* - function that runs, when event fired

##### onRegistrationFailed(callback)
Fired for registration failure
*callback* - function that runs, when event fired

##### onUnregistered(callback)
Fired for unregistration
*callback* - function that runs, when event fired

##### logout()
Disconnects from the WebSocket server after gracefully unregistering and terminates any active sessions

### YayFonCall
Class to manage calls

##### getSession()
Returns info about current session

##### getSessionId()
Returns id of current session

##### answer()
Answer the incoming session. Available only for incoming call

##### endCall()
Terminates current call

##### blindTransfer(phoneNumber)
Transfers the caller to another agent without speaking to the new agent first
*phoneNumber* - destination of the call

##### hold()
Puts the call on hold

##### unhold()
Resumes the call from hold

##### mute(true)
Mutes the local audio and/or video

##### unmute()
Unmutes the local audio and/or video

##### isIncomingCall()
Determines if the call is incoming

##### onAccept(callback)
Fired each time a successful final (200-299) response is received
*callback* - function that runs, when event fired

##### onProgress(callback)
Fired each time a provisional response is received
*callback* - function that runs, when event fired

##### onEnd(callback)
Fired when an established call ends
*callback* - function that runs, when event fired

##### onFail(callback)
Fired when the request fails, whether due to an unsuccessful final response or due to timeout, transport, or other
*callback* - function that runs, when event fired
