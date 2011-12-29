function PhoneSettings(controller) {
	this.controller = controller;
}

//

PhoneSettings.prototype.basic = function() {
	return false;
}

//

PhoneSettings.prototype.label = function() {
	return $L("Phone Settings");
}

//

PhoneSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;
	
	this.choicesPhoneReplySelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Do Nothing"), 'value': 0},
		{'label': $L("Send SMS Reply"), 'value': 1}];  

	this.controller.setupWidget("PhoneReplySelector", {'label': $L("On Call Reject"),	
		'labelPlacement': "left", 'modelProperty': "phoneAutoReply", 
		'choices': this.choicesPhoneReplySelector});

	this.controller.setupWidget("PhoneReplyText", {'hintText': $L("Auto SMS reply text..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false,
		'modelProperty': "phoneReplyText"});

	this.choicesPhoneBlinkSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("PhoneBlinkSelector", {'label': $L("Blink"),	
		'labelPlacement': "left", 'modelProperty': "phoneBlinkNotify", 
		'choices': this.choicesPhoneBlinkSelector});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	// Listen for change event for call reject selector
	
	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this) );
}

//

PhoneSettings.prototype.config = function() {
	var extensionConfig = {
		'phoneTitle': $L("Phone"),
		'phoneTextDisplay': "none",
		'phoneAutoReply': -1,
		'phoneReplyText': "",
		'phoneBlinkNotify': -1};
	
	return extensionConfig;
}

//

PhoneSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();
	
	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

PhoneSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();
	
	if(extensionPreferences.rejectAction != undefined) {
		if(extensionPreferences.rejectAction == "none")
			extensionConfig.phoneAutoReply = 0;
		else if(extensionPreferences.rejectAction == "autoreply")
			extensionConfig.phoneAutoReply = 1;
	}

	if(extensionConfig.phoneAutoReply == 1) {
		extensionConfig.phoneTextDisplay = "block";
	}

	if(extensionPreferences.rejectTemplate != undefined)
		extensionConfig.phoneReplyText = extensionPreferences.rejectTemplate;

	if(extensionPreferences.blinkNotify != undefined) {
		if(extensionPreferences.blinkNotify)
			extensionConfig.phoneBlinkNotify = 1;
		else
			extensionConfig.phoneBlinkNotify = 0;
	}
		
	return extensionConfig;
}

PhoneSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};
	
	if(extensionConfig.phoneAutoReply != -1) {
		if(extensionConfig.phoneAutoReply == 0)
			extensionPreferences.rejectAction = "none";
		else if(extensionConfig.phoneAutoReply == 1)
			extensionPreferences.rejectAction = "autoreply";
	}
		
	if(extensionConfig.phoneAutoReply == 1)
		extensionPreferences.rejectTemplate = extensionConfig.phoneReplyText;
	
	if(extensionConfig.phoneBlinkNotify == 1)
		extensionPreferences.blinkNotify = true;
	else if(extensionConfig.phoneBlinkNotify == 0)		
		extensionPreferences.blinkNotify = false;	
	
	return extensionPreferences;
}

//

PhoneSettings.prototype.export = function(extensionPreferences) {
}

PhoneSettings.prototype.import = function(extensionPreferences, doneCallback) {
	doneCallback();
}

//

PhoneSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "PhoneReplyHelp") {
		var helpTitle = "On Call Reject";

		var helpText = "Determines what to do when call is rejected. When set to send SMS reply, message application is opened with the prefilled caller number and text.";
	}
	else if(event.originalEvent.target.id == "PhoneTextHelp") {
		var helpTitle = "SMS Reply Template";

		var helpText = "Text to be prefilled for messaging application when call is rejected and SMS reply is in use.";
	}
	else if(event.originalEvent.target.id == "PhoneBlinkHelp") {
		var helpTitle = "Blink";

		var helpText = "Blink notification setting for phone call notifications. When enabled, the gesture area blinks when there are missed phone calls.";
	}
	else
		return;
	
	this.controller.showAlertDialog({
		title: helpTitle,
		message: "<div style='text-align:justify;'>" + helpText + "</div>",
		choices:[{"label": "Close", "command": "close"}],
		preventCancel: false,
		allowHTMLMessage: true
	});
}

//

PhoneSettings.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "phoneAutoReply") {
		changeEvent.model.phoneTextDisplay = "none";
		
		if(changeEvent.value == 1)
			changeEvent.model.phoneTextDisplay = "block";
						
		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
}

//

PhoneSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);

	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.phone", 'service': "com.palm.systemservice", 
				'method': "getPreferences", 'params': {'keys': ["callRejection", "callNotification"]}}, 
			'onComplete': requestCallback});
	}
	else
		doneCallback(extensionConfig);
}

PhoneSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if(serviceResponse.returnValue) {
		if(requestID == 0) {
			extensionConfig.phoneTextDisplay = "none";
			
			extensionConfig.phoneAutoReply = 0;
			extensionConfig.phoneReplyText = "Sorry, I am currently busy and will call you back later...";
			extensionConfig.phoneBlinkNotify = 1;				
			
			if((serviceResponse.callRejection) && 
				(serviceResponse.callRejection.rejectAction == "autoreply"))
			{
				extensionConfig.phoneAutoReply = 1;
				extensionConfig.phoneTextDisplay = "block";
			}

			if((serviceResponse.callRejection) && 
				(serviceResponse.callRejection.rejectTemplate != undefined))
			{
				extensionConfig.phoneReplyText = serviceResponse.callRejection.rejectTemplate;
			}

			if((serviceResponse.callNotification) && 
				(serviceResponse.callNotification.notificationBlink != undefined))
			{
				if(!serviceResponse.callNotification.notificationBlink)
					extensionConfig.phoneBlinkNotify = 0;
			}
		}
	}
	
	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

