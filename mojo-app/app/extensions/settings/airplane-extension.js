function AirplaneSettings(controller) {
	this.controller = controller;
}

//

AirplaneSettings.prototype.basic = function() {
	return true;
}

//

AirplaneSettings.prototype.label = function() {
	return $L("Airplane Settings");
}

//

AirplaneSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;
	
	this.choicesAirplaneModeSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("AirplaneModeSelector", {'label': $L("Flight Mode"),	
		'labelPlacement': "left", 'modelProperty': "airplaneFlightMode", 
		'choices': this.choicesAirplaneModeSelector});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

AirplaneSettings.prototype.config = function() {
	var extensionConfig = {
		'airplaneTitle': $L("Airplane"),
		'airplaneFlightMode': -1 };
	
	return extensionConfig;
}

//

AirplaneSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();

	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

AirplaneSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();

	if(extensionPreferences.flightMode != undefined) {
		if(extensionPreferences.flightMode)
			extensionConfig.airplaneFlightMode = 1;
		else
			extensionConfig.airplaneFlightMode = 0;		
	}
	
	return extensionConfig;
}

AirplaneSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};
	
	if(extensionConfig.airplaneFlightMode != -1) {
		if(extensionConfig.airplaneFlightMode == 0)
			extensionPreferences.flightMode = false;
		else
			extensionPreferences.flightMode = true;
	}
	
	return extensionPreferences;
}

//

AirplaneSettings.prototype.export = function(extensionPreferences) {
}

AirplaneSettings.prototype.import = function(extensionPreferences, doneCallback) {
	doneCallback();
}

//

AirplaneSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "AirplaneModeHelp") {
		var helpTitle = "Flight Mode";

		var helpText = "Airplane mode setting. When enabled, all radios (phone, wifi and bluetooth) are disabled.";
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

AirplaneSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);
	
	if(requestID == 0) {
		this.controller.serviceRequest("palm://com.palm.systemservice/", {'method': "getPreferences", 
			'parameters': {'keys': ["airplaneMode"]}, 'onComplete': requestCallback});
	}
	else
		doneCallback(extensionConfig);
}

AirplaneSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if(serviceResponse.returnValue) {	
		if(requestID == 0) {
			extensionConfig.airplaneFlightMode = serviceResponse.airplaneMode;
		}
	}
	
	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

