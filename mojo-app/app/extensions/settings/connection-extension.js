function ConnectionSettings(controller) {
	this.controller = controller;
}

//

ConnectionSettings.prototype.basic = function() {
	return true;
}

//

ConnectionSettings.prototype.label = function() {
	return $L("Connection Settings");
}

//

ConnectionSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;
	
	this.choicesPhoneSelector = [
		{'label': defaultChoiseLabel, value: -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("ConnectionPhoneSelector", {'label': $L("Phone"), 
		'labelPlacement': "left", 'modelProperty': "connectionPhoneState",
		'choices': this.choicesPhoneSelector});

	this.choicesDataSelector = [
		{'label': defaultChoiseLabel, value: -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("ConnectionDataSelector",	{'label': $L("Data"), 
		'labelPlacement': "left", 'modelProperty': "connectionDataState",
		'choices': this.choicesDataSelector});

	this.choicesWIFISelector = [
		{'label': defaultChoiseLabel, value: -1},
		{'label': $L("Enabled"), value: 1},
		{'label': $L("Disabled"), value: 0} ];  

	this.controller.setupWidget("ConnectionWIFISelector",	{'label': $L("Wi-Fi"), 
		'labelPlacement': "left", 'modelProperty': "connectionWifiState",
		'choices': this.choicesWIFISelector});

	this.choicesBTSelector = [
		{'label': defaultChoiseLabel, value: -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("ConnectionBTSelector", {'label': $L("Bluetooth"), 
		'labelPlacement': "left", 'modelProperty': "connectionBtState",
		'choices': this.choicesBTSelector});

	this.choicesGPSSelector = [
		{'label': defaultChoiseLabel, value: -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("ConnectionGPSSelector",	{'label': $L("GPS"), 
		'labelPlacement': "left", 'modelProperty': "connectionGpsState",
		'choices': this.choicesGPSSelector});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

ConnectionSettings.prototype.config = function() {
	var extensionConfig = {
		'connectionTitle': $L("Connections"),
		'connectionPhoneState': -1, 
		'connectionDataState': -1, 
		'connectionWifiState': -1, 
		'connectionBtState': -1, 
		'connectionGpsState': -1 };
	
	return extensionConfig;
}

//

ConnectionSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();
	
	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

ConnectionSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();
	
	if(extensionPreferences.phoneState != undefined) {
		if(extensionPreferences.phoneState == "on")
			extensionConfig.connectionPhoneState = 1;
		else
			extensionConfig.connectionPhoneState = 0;
	}
	
	if(extensionPreferences.dataState != undefined) {
		if(extensionPreferences.dataState == "off")
			extensionConfig.connectionDataState = 1;
		else
			extensionConfig.connectionDataState = 0;
	}

	if(extensionPreferences.wifiState != undefined) {
		if(extensionPreferences.wifiState == "enabled")
			extensionConfig.connectionWifiState = 1;
		else
			extensionConfig.connectionWifiState = 0;
	}
	
	if(extensionPreferences.btState != undefined) {
		if(extensionPreferences.btState == true)
			extensionConfig.connectionBtState = 1;
		else
			extensionConfig.connectionBtState = 0;
	}
		
	if(extensionPreferences.gpsState != undefined) {
		if(extensionPreferences.gpsState == true)
			extensionConfig.connectionGpsState = 1;
		else
			extensionConfig.connectionGpsState = 0;
	}
	
	return extensionConfig;
}

ConnectionSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};
	
	if(extensionConfig.connectionPhoneState != -1) {
		if(extensionConfig.connectionPhoneState == 1)
			extensionPreferences.phoneState = "on";
		else
			extensionPreferences.phoneState = "off";		
	}
	
	if(extensionConfig.connectionDataState != -1) {
		if(extensionConfig.connectionDataState == 1)
			extensionPreferences.dataState = "off";
		else
			extensionPreferences.dataState = "on";		
	}	

	if(extensionConfig.connectionWifiState != -1) {
		if(extensionConfig.connectionWifiState == 1)
			extensionPreferences.wifiState = "enabled";
		else
			extensionPreferences.wifiState = "disabled";		
	}
	
	if(extensionConfig.connectionBtState != -1) {
		if(extensionConfig.connectionBtState == 1)
			extensionPreferences.btState = true;
		else
			extensionPreferences.btState = false;		
	}
		
	if(extensionConfig.connectionGpsState != -1) {
		if(extensionConfig.connectionGpsState == 1)
			extensionPreferences.gpsState = true;
		else
			extensionPreferences.gpsState = false;		
	}
	
	return extensionPreferences;
}

//

ConnectionSettings.prototype.export = function(extensionPreferences) {
}

ConnectionSettings.prototype.import = function(extensionPreferences, doneCallback) {
	doneCallback();
}

//

ConnectionSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "ConnectionPhoneHelp") {
		var helpTitle = "Phone";

		var helpText = "Phone connection state. When disabled, the phones GSM/CDMA radio is turned off.";
	}
	else if(event.originalEvent.target.id == "ConnectionDataHelp") {
		var helpTitle = "Phone";

		var helpText = "Data connection state. When disabled, no data connection is used.";
	}
	else if(event.originalEvent.target.id == "ConnectionWIFIHelp") {
		var helpTitle = "Phone";

		var helpText = "Wi-Fi connection state. When disabled, the wireless connection is not used.";
	}
	else if(event.originalEvent.target.id == "ConnectionBTHelp") {
		var helpTitle = "Phone";

		var helpText = "Bluetooth connection state. When disabled, bluetooth connection is not used.";
	}
	else if(event.originalEvent.target.id == "ConnectionGPSHelp") {
		var helpTitle = "Phone";

		var helpText = "GPS connection state. When disabled, the GPS connection is not used.";
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

ConnectionSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);
	
	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.phone", 'service': "com.palm.telephony", 
				'method': "powerQuery", 'params': {}}, 
			'onComplete': requestCallback});		
	}
	else if(requestID == 1) {
		this.controller.serviceRequest("palm://com.palm.connectionmanager/", {'method': "getstatus", 
			'parameters': {}, 'onComplete': requestCallback});
	}
	else if(requestID == 2) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.wifi", 'service': "com.palm.wifi", 
				'method': "getstatus", 'params': {}},
			'onComplete': requestCallback});
	}
	else if(requestID == 3) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.bluetooth", 'service': "com.palm.btmonitor/monitor", 
				'method': "getradiostate", 'params': {}},
			'onComplete': requestCallback});
	}
	else if(requestID == 4) {
		this.controller.serviceRequest("palm://com.palm.location/", {'method': "getUseGps", 
			'parameters': {}, 'onComplete': requestCallback});
	}
	else
		doneCallback(extensionConfig);
}

ConnectionSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if((serviceResponse.returnValue) || (serviceResponse.returnValue == undefined)) {
		if(requestID == 0) {
			if(serviceResponse.extended) {
				if((serviceResponse.extended.powerState) && (serviceResponse.extended.powerState == 'on'))
					extensionConfig.connectionPhoneState = 1;
				else 
					extensionConfig.connectionPhoneState = 0;
			}
		}
		else if(requestID == 1) {
			if(serviceResponse.wan) {
				if(serviceResponse.wan.state == "connected")
					extensionConfig.connectionDataState = 1;
				else 
					extensionConfig.connectionDataState = 0;
			}
		}
		else if(requestID == 2) {
			if (serviceResponse.status == 'serviceDisabled')
				extensionConfig.connectionWifiState = 0;
			else
				extensionConfig.connectionWifiState = 1;
		}
		else if(requestID == 3) {
			if((serviceResponse.radio == "turningoff") || (serviceResponse.radio == "off"))
				extensionConfig.connectionBtState = 0;
			else
				extensionConfig.connectionBtState = 1;
		}
		else if(requestID == 4) {
			if(serviceResponse.useGps)
				extensionConfig.connectionGpsState = 1;
			else
				extensionConfig.connectionGpsState = 0;
		}
	}

	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

