function SecuritySettings(controller) {
	this.controller = controller;
}

//

SecuritySettings.prototype.basic = function() {
	return true;
}

//

SecuritySettings.prototype.label = function() {
	return $L("Security Settings");
}

//

SecuritySettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;
	
	this.choicesSecurityLockSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Unsecure"), 'value': 0},
		{'label': $L("Simple PIN"), 'value': 1},
		{'label': $L("Password"), 'value': 2} ];  

	this.controller.setupWidget("SecurityLockSelector", {'label': $L("Unlock Mode"), 
		'labelPlacement': "left", 'modelProperty': "securityLockMode",
		'choices': this.choicesSecurityLockSelector});

	this.controller.setupWidget("SecurityPINText", {'hintText': $L("Enter PIN..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 
		'modifierState': Mojo.Widget.numLock, 'modelProperty': "securityLockSecretPIN", 
		'charsAllow': this.checkPINCharacter.bind(this)});

	this.controller.setupWidget("SecurityPINText2", {'hintText': $L("Enter PIN Again..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 
		'modifierState': Mojo.Widget.numLock, 'modelProperty': "securityLockSecretPIN2", 
		'charsAllow': this.checkPINCharacter.bind(this)});

	this.controller.setupWidget("SecurityPWText", {'hintText': $L("Enter Password..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 
		'textCase': Mojo.Widget.steModeLowerCase, 'modelProperty': "securityLockSecretPW"});

	this.controller.setupWidget("SecurityPWText2", {'hintText': $L("Enter Password Again..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 
		'textCase': Mojo.Widget.steModeLowerCase, 'modelProperty': "securityLockSecretPW2"});

	this.choicesSecurityTimeoutSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Screen Turns Off"), 'value': 0},
		{'label': $L("30 Seconds"), 'value': 30},
		{'label': $L("1 Minute"), 'value': 60},
		{'label': $L("2 Minutes"), 'value': 120},
		{'label': $L("3 Minutes"), 'value': 180},
		{'label': $L("5 Minutes"), 'value': 300},
		{'label': $L("10 Minutes"), 'value': 600},
		{'label': $L("30 Minutes"), 'value': 1800} ];  

	this.controller.setupWidget("SecurityTimeoutSelector", {'label': $L("Lock After"), 
		'labelPlacement': "left", 'modelProperty': "securityLockTimeout",
		'choices': this.choicesSecurityTimeoutSelector});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	// Listen for keyboard event for secret text field

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
}

//

SecuritySettings.prototype.config = function() {
	var extensionConfig = {
		'securityTitle': $L("Security"),
		'securityPinDisplay': "none",
		'securityPwDisplay': "none",
		'securityPinDisplay2': "none",
		'securityPwDisplay2': "none",
		'securityTimeoutDisplay': "none",
		'securityLockRow': "single",
		'securityLockMode': -1, 
		'securityLockSecretPIN': "",
		'securityLockSecretPW': "",
		'securityLockSecretPIN2': "",
		'securityLockSecretPW2': "",
		'securityLockTimeout': -1 };
	
	return extensionConfig;
}

//

SecuritySettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();
	
	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

SecuritySettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();

	if(extensionPreferences.lockMode == "none")
		extensionConfig.securityLockMode = 0;
	else if(extensionPreferences.lockMode == "pin")
		extensionConfig.securityLockMode = 1;
	else if(extensionPreferences.lockMode == "password")
		extensionConfig.securityLockMode = 2;

	if(extensionConfig.securityLockMode != 0)
		extensionConfig.securityTimeoutDisplay = "block";
	
	if(extensionConfig.securityLockMode == 1) {
		extensionConfig.securityLockRow = "first";
		extensionConfig.securityPinDisplay = "block";
		extensionConfig.securityLockSecretPIN = extensionPreferences.lockSecret;
		extensionConfig.securityLockSecretPIN2 = extensionPreferences.lockSecret;
	}
	else if(extensionConfig.securityLockMode == 2) {
		extensionConfig.securityLockRow = "first";
		extensionConfig.securityPwDisplay = "block";
		extensionConfig.securityTimeoutDisplay = "block";
		extensionConfig.securityLockSecretPW = extensionPreferences.lockSecret;
		extensionConfig.securityLockSecretPW2 = extensionPreferences.lockSecret;
	}
	
	if(extensionConfig.securityLockTimeout != undefined)
		extensionConfig.securityLockTimeout = extensionPreferences.lockTimeout;
	
	return extensionConfig;
}

SecuritySettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};

	if(extensionConfig.securityLockMode == 0) {
		extensionPreferences.lockMode = "none";
		extensionPreferences.lockSecret = "";
	}
	else if(extensionConfig.securityLockMode == 1) {
		extensionPreferences.lockMode = "pin";
		
		if((extensionConfig.securityLockSecretPIN.length > 0) &&
			(extensionConfig.securityLockSecretPIN == extensionConfig.securityLockSecretPIN2))
		{
			extensionPreferences.lockSecret = extensionConfig.securityLockSecretPIN;

			extensionPreferences.lockTimeout = parseInt(extensionConfig.securityLockTimeout);
		}
		else
			extensionPreferences.lockMode = "none";		
	}
	else if(extensionConfig.securityLockMode == 2) {
		extensionPreferences.lockMode = "password";

		if((extensionConfig.securityLockSecretPW.length > 0) &&
			(extensionConfig.securityLockSecretPW == extensionConfig.securityLockSecretPW2))
		{
			extensionPreferences.lockSecret = extensionConfig.securityLockSecretPW;

			extensionPreferences.lockTimeout = parseInt(extensionConfig.securityLockTimeout);
		}
		else
			extensionPreferences.lockMode = "none";		
	}

	return extensionPreferences;
}

//

SecuritySettings.prototype.export = function(extensionPreferences) {
	if(extensionPreferences.lockSecret != undefined)
		extensionPreferences.lockSecret = "";
}

SecuritySettings.prototype.import = function(extensionPreferences, doneCallback) {
	doneCallback();
}

//

SecuritySettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "SecurityLockHelp") {
		var helpTitle = "Unlock Mode";

		var helpText = "Security lock mode setting. Lock mode for screen when turned off.";
	}
	else if((event.originalEvent.target.id == "SecurityPINHelp") ||
		(event.originalEvent.target.id == "SecurityPINHelp2"))
	{
		var helpTitle = "PIN Code";

		var helpText = "PIN code for the screen lock. When the entered pins match the second input field gets hidden.";
	}
	else if((event.originalEvent.target.id == "SecurityPWHelp") ||
		(event.originalEvent.target.id == "SecurityPWHelp2"))
	{
		var helpTitle = "Password";

		var helpText = "Password for the screen lock. When entered passwords match the second input field gets hidden.";
	}
	else if(event.originalEvent.target.id == "SecurityTimeoutHelp") {
		var helpTitle = "Lock After";

		var helpText = "Security timeout setting. Timeout for the security lock to take place after turning screen off.";
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

SecuritySettings.prototype.checkPINCharacter = function(keyEvent) {
	if((keyEvent >= 48) && (keyEvent <= 57))
		return true;
	else
		return false;
}

//

SecuritySettings.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "securityLockMode") {
		changeEvent.model.securityLockRow = "single";

		changeEvent.model.securityPinDisplay = "none";
		changeEvent.model.securityPinDisplay2 = "none";
		changeEvent.model.securityPwDisplay = "none";
		changeEvent.model.securityPwDisplay2 = "none";
		changeEvent.model.securityTimeoutDisplay = "none";		
		
		changeEvent.model.securityLockSecretPIN = "";
		changeEvent.model.securityLockSecretPIN2 = "";

		changeEvent.model.securityLockSecretPW = "";
		changeEvent.model.securityLockSecretPW2 = "";

		if(changeEvent.value != 0)
			changeEvent.model.securityTimeoutDisplay = "block";		
				
		if(changeEvent.value == 1) {
			changeEvent.model.securityLockRow = "first";
			changeEvent.model.securityPinDisplay = "block";			
			changeEvent.model.securityPinDisplay2 = "block";
		}
		else if(changeEvent.value == 2) {
			changeEvent.model.securityLockRow = "first";
			changeEvent.model.securityPwDisplay = "block";
			changeEvent.model.securityPwDisplay2 = "block";			
		}
		
		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
	else if((changeEvent.property == "securityLockSecretPIN") ||
		(changeEvent.property == "securityLockSecretPIN2"))
	{
		if((changeEvent.model.securityLockSecretPIN.length > 0) &&
			(changeEvent.model.securityLockSecretPIN == changeEvent.model.securityLockSecretPIN2))
		{
			changeEvent.model.securityPinDisplay2 = "none";
		}
		else
			changeEvent.model.securityPinDisplay2 = "block";
		
		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
	
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
	else if((changeEvent.property == "securityLockSecretPW") ||
		(changeEvent.property == "securityLockSecretPW2"))
	{
		if((changeEvent.model.securityLockSecretPW.length > 0) &&
			(changeEvent.model.securityLockSecretPW == changeEvent.model.securityLockSecretPW2))
		{
			changeEvent.model.securityPwDisplay2 = "none";
		}
		else
			changeEvent.model.securityPwDisplay2 = "block";

		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
	
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
}

//

SecuritySettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);
	
	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.screenlock", 'service': "com.palm.systemmanager", 
				'method': "getDeviceLockMode", 'params': {}}, 'onComplete': requestCallback});	
	}
	else if(requestID == 1) {
		this.controller.serviceRequest("palm://com.palm.systemservice", {'method': "getPreferences", 
			'parameters': {'keys': ["lockTimeout"]}, 'onComplete': requestCallback});	
	}
	else
		doneCallback(extensionConfig);
}

SecuritySettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if(serviceResponse.returnValue) {
		if(requestID == 0) {
			extensionConfig.securityLockMode = 0;
			
			if(serviceResponse.lockMode == "pin")
				extensionConfig.securityLockMode = 1;
			else if(serviceResponse.lockMode == "password")
				extensionConfig.securityLockMode = 2;
		
			extensionConfig.securityLockRow = "single";
			extensionConfig.securityPinDisplay = "none";
			extensionConfig.securityPinDisplay2 = "none";
			extensionConfig.securityPwDisplay = "none";
			extensionConfig.securityPwDisplay2 = "none";
			extensionConfig.securityTimeoutDisplay = "none";

			extensionConfig.securityLockSecretPIN = "";
			extensionConfig.securityLockSecretPW = "";
			extensionConfig.securityLockSecretPIN2 = "";
			extensionConfig.securityLockSecretPW2 = "";
		
			if(extensionConfig.securityLockMode == 1) {
				extensionConfig.securityLockRow = "first";
				extensionConfig.securityPinDisplay = "block";
				extensionConfig.securityPinDisplay2 = "block";
				extensionConfig.securityTimeoutDisplay = "block";
				extensionConfig.securityLockSecretPIN = "";
				extensionConfig.securityLockSecretPIN2 = "";
			}
			else if(extensionConfig.securityLockMode == 2) {
				extensionConfig.securityLockRow = "first";
				extensionConfig.securityPwDisplay = "block";
				extensionConfig.securityPwDisplay2 = "block";
				extensionConfig.securityTimeoutDisplay = "block";
				extensionConfig.securityLockSecretPW = "";
				extensionConfig.securityLockSecretPW2 = "";
			}
		}
		else if(requestID == 1) {
			extensionConfig.securityLockTimeout = serviceResponse.lockTimeout;
		}
	}
			
	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

