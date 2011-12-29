function SoundSettings(controller) {
	this.controller = controller;
}

//

SoundSettings.prototype.basic = function() {
	return true;
}

//

SoundSettings.prototype.label = function() {
	return $L("Sound Settings");
}

//

SoundSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;
	
	// Ringer, System and Media volume selectors
	
	this.choicesRingerVolumeSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Minimum"), 'value': 0},
		{'label': $L("Maximum"), 'value': 100} ];  

	this.controller.setupWidget("SoundRingerSelector", {'label': $L("Ringer"), 
		'labelPlacement': "left", 'modelProperty': "soundRinger",
		'choices': this.choicesRingerVolumeSelector});
		
	this.controller.setupWidget("SoundRingerSlider", {'minValue': -1, 'maxValue': 100, 
		'round': true, 'modelProperty': "soundRinger"});

	this.choicesSystemVolumeSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Minimum"), 'value': 0},
		{'label': $L("Maximum"), 'value': 100} ];  

	this.controller.setupWidget("SoundSystemSelector", {'label': $L("System"), 
		'labelPlacement': "left", 'modelProperty': "soundSystem",
		'choices': this.choicesSystemVolumeSelector});
		
	this.controller.setupWidget("SoundSystemSlider", {'minValue': -1, 'maxValue': 100, 
		'round': true, 'modelProperty': "soundSystem"});

	this.choicesMediaVolumeSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Minimum"), 'value': 0},
		{'label': $L("Maximum"), 'value': 100} ];  

	this.controller.setupWidget("SoundMediaSelector", {'label': $L("Media"), 
		'labelPlacement': "left", 'modelProperty': "soundMedia",
		'choices': this.choicesMediaVolumeSelector});

	this.controller.setupWidget("SoundMediaSlider", {'minValue': -1, 'maxValue': 100, 
		'round': true, 'modelProperty': "soundMedia"});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

SoundSettings.prototype.config = function() {
	var extensionConfig = {
		'soundTitle': $L("Sounds"),
		'soundRinger': -1, 
		'soundSystem': -1, 
		'soundMedia': -1 };
	
	return extensionConfig;
}

//

SoundSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();

	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

SoundSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();
	
	if(extensionPreferences.ringerVolume != undefined)
		extensionConfig.soundRinger = extensionPreferences.ringerVolume;

	if(extensionPreferences.systemVolume != undefined)
		extensionConfig.soundSystem = extensionPreferences.systemVolume; 

	if(extensionPreferences.mediaVolume != undefined)
		extensionConfig.soundMedia = extensionPreferences.mediaVolume;
	
	return extensionConfig;
}

SoundSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};
	
	if(extensionConfig.soundRinger != -1)
		extensionPreferences.ringerVolume = parseInt(extensionConfig.soundRinger);

	if(extensionConfig.soundSystem != -1)
		extensionPreferences.systemVolume = parseInt(extensionConfig.soundSystem);

	if(extensionConfig.soundMedia != -1)
		extensionPreferences.mediaVolume = parseInt(extensionConfig.soundMedia);
	
	return extensionPreferences;
}

//

SoundSettings.prototype.export = function(extensionPreferences) {
}

SoundSettings.prototype.import = function(extensionPreferences, doneCallback) {
	doneCallback();
}

//

SoundSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "SoundRingerHelp") {
		var helpTitle = "Ringer";

		var helpText = "Volume level for ringer alert.";
	}
	else if(event.originalEvent.target.id == "SoundSystemHelp") {
		var helpTitle = "System";

		var helpText = "Volume level for system sounds.";
	}
	else if(event.originalEvent.target.id == "SoundMediaHelp") {
		var helpTitle = "Media";

		var helpText = "Volume level for media (audio, video etc.).";
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

SoundSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);
	
	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/ringtone", 
				'method': "status", 'params': {}}, 
			'onComplete': requestCallback});		
	}
	else if(requestID == 1) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/system", 
				'method': "status", 'params': {}}, 
			'onComplete': requestCallback});		
	}
	else if(requestID == 2) {
		this.controller.serviceRequest("palm://com.palm.audio/media/", {'method': "status",
			'parameters': {}, 'onComplete': requestCallback }); 
	}
	else
		doneCallback(extensionConfig);
}

SoundSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if(serviceResponse.returnValue) {
		if(requestID == 0) {
			extensionConfig.soundRinger = serviceResponse.volume;
		}
		else if(requestID == 1) {
			extensionConfig.soundSystem = serviceResponse.volume;
		}
		else if(requestID == 2) {
			extensionConfig.soundMedia = serviceResponse.volume;
		}
	}
	
	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

