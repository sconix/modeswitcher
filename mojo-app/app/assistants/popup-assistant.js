/*
 *    PopupAssistant - The Actual Mode Launcher Scene
*/


function PopupAssistant(view, params) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

	this.appControl = Mojo.Controller.getAppController();
	this.appAssistant = this.appControl.assistant;

	this.view = view;

	if(view == "toggle") {
		this.modeName = params.name;
	}
	else if(view == "popup") {
		this.notify = "none"

		if((params.notify == 3) || (params.notify == 5))
			this.notify = "notifications";
		else if((params.notify == 4) || (params.notify == 6))
			this.notify = "vibrate";
		
		this.newModes = params.names;

		this.startNModes = params.modes.startN;
		this.closeNModes = params.modes.closeN;

		this.startMModes = params.modes.startM;
		this.closeMModes = params.modes.closeM;

		this.startTimer = params.timers.start / 1000;
		this.closeTimer = params.timers.close / 1000;
	}
}    

PopupAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */

	this.controller.get(this.view).show();

	// Buttons
	
	if(this.event == "start")
		this.modelStartButton = {label: $L("Switch Mode"), buttonClass : 'affirmative popupbutton', disabled : false};
   else
   	this.modelStartButton = {label: $L("Close Mode"), buttonClass : 'affirmative popupbutton', disabled : false};
   	     
	this.controller.setupWidget('StartButton', {}, this.modelStartButton);

	Mojo.Event.listen(this.controller.get('StartButton'), Mojo.Event.tap, 
		this.handleStartButtonPress.bind(this));

	this.modelSelectButton = {label: $L("Default Mode"), buttonClass : 'popupbutton', disabled : true};
  
   this.controller.setupWidget('SelectButton', {}, this.modelSelectButton);

	Mojo.Event.listen(this.controller.get('SelectButton'), Mojo.Event.tap, 
		this.handleSelectButtonPress.bind(this));
   
 	this.modelCancelButton = {label: $L("Cancel"), buttonClass : 'negative popupbutton', disabled : false};

	this.controller.setupWidget('CancelButton', {}, this.modelCancelButton);

	Mojo.Event.listen(this.controller.get('CancelButton'), Mojo.Event.tap, 
		this.handleCancelButtonPress.bind(this));
	
	if(this.view == "popup") {
		this.selectEvent(true);
	}
	else if(this.view == "toggle") {
		this.controller.document.body.style.backgroundColor = "#000000";

		this.controller.get("modeName").update(this.modeName);
	}
}

PopupAssistant.prototype.setupStart = function() {
	clearTimeout(this.timer);

	if(this.event == "start-n") {	
		var startModes = this.startNModes;
	
		this.modelStartButton.label = $L("Switch Mode");
	}
	else if(this.event == "start-m") {
		var startModes = this.startMModes;

		this.modelStartButton.label = $L("Start Mode");
	}
		
	this.controller.modelChanged(this.modelStartButton, this);

	this.modelCancelButton.label = $L("Cancel");
	this.controller.modelChanged(this.modelCancelButton, this);

	this.counterCancel = this.startTimer;
	this.counterStart = this.startTimer;

	// Give priority for modes with after timer setting

	for(var i = 0 ; i < startModes.length ; i++) {
		if(startModes[i].start == 2) {
			this.modeidx = i;

			break;
		}
	}

	this.modelSelectButton.label = startModes[this.modeidx].name;
	this.controller.modelChanged(this.modelSelectButton, this);

	if(startModes[this.modeidx].start == 2)
		this.updateStartTimer();
	else
		this.updateCancelTimer();
}

PopupAssistant.prototype.setupClose = function() {
	clearTimeout(this.timer);

	if(this.event == "close-n") {	
		var closeModes = this.closeNModes;
	
		this.modelStartButton.label = $L("Close Mode");
	}
	else if(this.event == "close-m") {
		var closeModes = this.closeMModes;

		this.modelStartButton.label = $L("Close Mode");
	}

	this.controller.modelChanged(this.modelStartButton, this);

	this.modelCancelButton.label = $L("Cancel");
	this.controller.modelChanged(this.modelCancelButton, this);

	this.counterCancel = this.closeTimer;
	this.counterClose = this.closeTimer;

	// Give priority for modes with after timer setting

	for(var i = 0 ; i < closeModes.length ; i++) {
		if(closeModes[i].close == 2) {
			this.modeidx = i;

			break;
		}
	}

	this.modelSelectButton.label = closeModes[this.modeidx].name;
	this.controller.modelChanged(this.modelSelectButton, this);

	if(closeModes[this.modeidx].close == 2)
		this.updateCloseTimer();
	else
		this.updateCancelTimer();
}

PopupAssistant.prototype.updateCancelTimer = function() {
	if(this.counterCancel >= 0) {
		this.modelCancelButton.label = $L("Cancel") + " (" + this.counterCancel-- + ")";
		this.controller.modelChanged(this.modelCancelButton, this);
		
		this.timer = setTimeout(this.updateCancelTimer.bind(this), 1000);
	}
	else
		this.handleCancelButtonPress();
}

PopupAssistant.prototype.updateStartTimer = function() {
	if(this.counterStart >= 0) {
		if(this.event == "start-n")
			this.modelStartButton.label = $L("Switch Mode") + " (" + this.counterStart-- + ")";
		else if(this.event == "start-m")
			this.modelStartButton.label = $L("Start Mode") + " (" + this.counterStart-- + ")";
			
		this.controller.modelChanged(this.modelStartButton, this);
		
		this.timer = setTimeout(this.updateStartTimer.bind(this), 1000);
	}
	else
		this.handleStartButtonPress();
}

PopupAssistant.prototype.updateCloseTimer = function() {
	if(this.counterClose >= 0) {
		this.modelStartButton.label = $L("Close Mode") + " (" + this.counterClose-- + ")";
		this.controller.modelChanged(this.modelStartButton, this);
		
		this.timer = setTimeout(this.updateCloseTimer.bind(this), 1000);
	}
	else
		this.handleStartButtonPress();
}

PopupAssistant.prototype.handleStartButtonPress = function() {
	clearTimeout(this.timer);

	if(this.event == "start-n") {
		this.newModes[0] = this.startNModes[this.modeidx].name;
		
		this.startNModes.clear();
		this.closeNModes.clear();
	}
	else if(this.event == "start-m") {
		this.newModes.push(this.startMModes[this.modeidx].name);
		
		this.startMModes.splice(this.modeidx, 1);
	}
	else if(this.event == "close-n") {
		this.newModes[0] = "Default Mode";
		
		this.closeNModes.clear();
	}
	else if(this.event == "close-m") {
		var index = this.newModes.indexOf(this.closeMModes[this.modeidx].name)
	
		this.newModes.splice(index, 1);
		
		this.closeMModes.splice(this.modeidx, 1);
	}

	this.selectEvent(false);
}

PopupAssistant.prototype.handleSelectButtonPress = function() {
	clearTimeout(this.timer);

	if((this.event == "start-n") && (this.startNModes.length > 1)) {
		this.modelStartButton.label = $L("Switch Mode");
		
		this.controller.modelChanged(this.modelStartButton, this);

		this.modelCancelButton.label = $L("Cancel");
		this.controller.modelChanged(this.modelCancelButton, this);

		this.modeidx++;
	
		if(this.modeidx == this.startNModes.length)
			this.modeidx = 0;

		this.modelSelectButton.label = this.startNModes[this.modeidx].name;
		this.controller.modelChanged(this.modelSelectButton, this);
	}
}

PopupAssistant.prototype.handleCancelButtonPress = function() {
	clearTimeout(this.timer);

	if(this.event == "start-n") {
		this.startNModes.clear();
	}
	else if(this.event == "start-m") {
		this.startMModes.splice(this.modeidx, 1);
	}
	else if(this.event == "close-n") {
		this.closeNModes.clear();
	}
	else if(this.event == "close-m") {
		this.closeMModes.splice(this.modeidx, 1);
	}

	this.selectEvent(false);
}	

PopupAssistant.prototype.selectEvent = function(init) {
	this.modeidx = 0;

	this.modelSelectButton.disabled = true;

	if(this.startNModes.length > 0) {
		this.event = "start-n";
		
		if(this.startNModes.length > 1)
			this.modelSelectButton.disabled = false;
	}
	else if(this.closeNModes.length > 0)
		this.event = "close-n";
	else if(this.startMModes.length > 0)
		this.event = "start-m";
	else if(this.closeMModes.length > 0)
		this.event = "close-m";
	else {
		this.controller.window.close();
		
		return;
	}

	this.controller.modelChanged(this.modelSelectButton, this);

	if((this.event == "start-n") || (this.event == "start-m"))
		var timeout = this.startTimer * 1000 + 5000;
	else if((this.event == "close-n") || (this.event == "close-m"))
		var timeout = this.closeTimer * 1000 + 5000;

	this.controller.serviceRequest("palm://com.palm.power/com/palm/power", {
		'method': "activityStart", 'parameters': {'id': Mojo.Controller.appInfo.id,
		'duration_ms': timeout} });

	if((!init) && (this.notify != "none")) {
		var appController = Mojo.Controller.getAppController();
		
		appController.playSoundNotification(this.notify);
	}
	
	if((this.event == "start-n") || (this.event == "start-m"))
		this.setupStart();
	else if((this.event == "close-n") || (this.event == "close-m"))
		this.setupClose();
}

PopupAssistant.prototype.close = function() {
	this.controller.window.close();
}

PopupAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document. 
	 */

	if(this.view == "toggle") {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'execute', parameters: {action: "toggle", name: this.modeName},
			onComplete: function() {
				setTimeout(this.close.bind(this), 500);
			}.bind(this)});
	}
}
	
PopupAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

PopupAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */    

	if(this.view == "popup") {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {'method': "execute", 
			'parameters': {'action': "update", 'names': this.newModes, 'notify': false}});
	}
}

