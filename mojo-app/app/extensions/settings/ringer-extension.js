function RingerSettings(controller) {
	this.controller = controller;
}

//

RingerSettings.prototype.basic = function() {
	return true;
}

//

RingerSettings.prototype.label = function() {
	return $L("Ringer Settings");
}

//

RingerSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;
	
	this.choicesRingerOnSelector = [
		{'label': defaultChoiseLabel, 'value': -1},		
		{'label': $L("Sound & Vibrate"), 'value': 1},
		{'label': $L("Sound Only"), 'value': 0} ];  

	this.controller.setupWidget("RingerOnSelector", {'label': $L("Switch On"), 
		'labelPlacement': "left", 'modelProperty': "ringerSwitchOn",
		'choices': this.choicesRingerOnSelector});

	this.choicesRingerOffSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Vibrate"), 'value': 1},
		{'label': $L("Mute"), 'value': 0}];  

	this.controller.setupWidget("RingerOffSelector", {'label': $L("Switch Off"), 
		'labelPlacement': "left", 'modelProperty': "ringerSwitchOff",
		'choices': this.choicesRingerOffSelector});

	this.choicesRingerRingtone = [
		{'label': defaultChoiseLabel, 'value': ""},
		{'label': $L("Select"), 'value': "select"} ];  

	this.controller.setupWidget("RingerRingtoneSelector", {'label': $L("Ringtone"), 
		'labelPlacement': "left", 'modelProperty': "ringerRingtoneName",
		'choices': this.choicesRingerRingtone});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
		
	// Listen for change event for ringtone selector
	
	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
}

//

RingerSettings.prototype.config = function() {
	var extensionConfig = {
		'ringerTitle': $L("Ringer"),
		'ringerSwitchOn': -1, 
		'ringerSwitchOff': -1, 
		'ringerRingtoneName': "", 
		'ringerRingtonePath': "" };
	
	return extensionConfig;
}

//

RingerSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();
	
	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

RingerSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();
	
	if(extensionPreferences.switchOn != undefined) {
		if(extensionPreferences.switchOn == true)
			extensionConfig.ringerSwitchOn = 1;
		else
			extensionConfig.ringerSwitchOn = 0;
	}
	
	if(extensionPreferences.switchOff != undefined) {
		if(extensionPreferences.switchOff == true)
			extensionConfig.ringerSwitchOff = 1;
		else
			extensionConfig.ringerSwitchOff = 0;	
	}

	if(extensionPreferences.ringtonePath != undefined) {
		extensionConfig.ringerRingtoneName = extensionPreferences.ringtoneName;
		extensionConfig.ringerRingtonePath = extensionPreferences.ringtonePath;
	}
	
	return extensionConfig;
}

RingerSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};
	
	if(extensionConfig.ringerSwitchOn != -1) {
		if(extensionConfig.ringerSwitchOn == 1)
			extensionPreferences.switchOn = true;
		else
			extensionPreferences.switchOn = false;
	}
	
	if(extensionConfig.ringerSwitchOff != -1) {
		if(extensionConfig.ringerSwitchOff == 1)
			extensionPreferences.switchOff = true;
		else
			extensionPreferences.switchOff = false;
	}

	if(extensionConfig.ringerRingtonePath.length != 0) {
		extensionPreferences.ringtoneName = extensionConfig.ringerRingtoneName;
		extensionPreferences.ringtonePath = extensionConfig.ringerRingtonePath;
	}

	return extensionPreferences;
}

//

RingerSettings.prototype.export = function(extensionPreferences) {
}

RingerSettings.prototype.import = function(extensionPreferences, doneCallback) {
	doneCallback();
}

//

RingerSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "RingerOnHelp") {
		var helpTitle = "Switch On";

		var helpText = "Ringer switch setting. Global alert mode for the phone when ringer switch is in on position.";
	}
	else if(event.originalEvent.target.id == "RingerOffHelp") {
		var helpTitle = "Switch Off";

		var helpText = "Ringer switch setting. Global alert mode for the phone when ringer switch is in off position.";
	}
	else if(event.originalEvent.target.id == "RingerRingtoneHelp") {
		var helpTitle = "Ringtone";

		var helpText = "Ringer ringtone setting. Ringtone for phone calls when ringer switch is in on position.";
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

RingerSettings.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "ringerRingtoneName") {
		changeEvent.model.ringerRingtoneName = "";		
		changeEvent.model.ringerRingtonePath = "";		

		this.controller.modelChanged(changeEvent.model, this);

		if(changeEvent.value == "select") {
			this.executeRingerSelect(changeEvent.model);
		}
	}	
}

//

RingerSettings.prototype.executeRingerSelect = function(eventModel) {
	Mojo.FilePicker.pickFile({'defaultKind': "ringtone", 'kinds': ["ringtone"], 
		'actionType': "attach", 'actionName': $L("Done"), 'onSelect': 
			function(eventModel, serviceResponse) {
				eventModel.ringerRingtoneName = serviceResponse.name;
				eventModel.ringerRingtonePath = serviceResponse.fullPath;
				
				this.controller.modelChanged(eventModel, this);	
			}.bind(this, eventModel)},
		this.controller.stageController);
}

//

RingerSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);
	
	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.soundandalerts", 'service': "com.palm.audio/state", 
				'method': "getPreference", 'params': {'names': ["VibrateWhenRingerOn", "VibrateWhenRingerOff"]}}, 
			'onComplete': requestCallback});		
	}
	else if(requestID == 1) {
		this.controller.serviceRequest("palm://com.palm.systemservice/", {'method': "getPreferences", 
			'parameters': {'keys': ["ringtone"]}, 
			'onComplete': requestCallback});
	}
	else
		doneCallback(extensionConfig);
}

RingerSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	
	if(serviceResponse.returnValue) {
		if(requestID == 0) {
			if(serviceResponse.VibrateWhenRingerOn)
				extensionConfig.ringerSwitchOn = 1;
			else
				extensionConfig.ringerSwitchOn = 0;

			if(serviceResponse.VibrateWhenRingerOff)
				extensionConfig.ringerSwitchOff = 1;
			else
				extensionConfig.ringerSwitchOff = 0;
		}
		else if(requestID == 1) {
			extensionConfig.ringerRingtoneName = serviceResponse.ringtone.name;
			extensionConfig.ringerRingtonePath = serviceResponse.ringtone.fullPath;
		}
	}

	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

