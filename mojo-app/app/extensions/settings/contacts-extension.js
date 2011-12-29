function ContactsSettings(controller) {
	this.controller = controller;
}

//

ContactsSettings.prototype.basic = function() {
	return false;
}

//

ContactsSettings.prototype.label = function() {
	return $L("Contacts Settings");
}

//

ContactsSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;
	
	this.choicesContactsBlockedSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("ContactsBlockedSelector", {'label': $L("Blocked"),	
		'labelPlacement': "left", 'modelProperty': "contactsBlockedNumbers", 
		'choices': this.choicesContactsBlockedSelector});

	this.choicesContactsUnknownSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("ContactsUnknownSelector", {'label': $L("Unknown"),	
		'labelPlacement': "left", 'modelProperty': "contactsUnknownNumbers", 
		'choices': this.choicesContactsUnknownSelector});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

ContactsSettings.prototype.config = function() {
	var extensionConfig = {
		'contactsTitle': $L("Contacts"),
		'contactsDatabaseId': -1,
		'contactsBlockedNumbers': -1,
		'contactsUnknownNumbers': -1};
	
	return extensionConfig;
}

//

ContactsSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();
	
	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

ContactsSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();
	
	if(extensionPreferences.databaseId != undefined)
		extensionConfig.contactsDatabaseId = extensionPreferences.databaseId;
	
	if(extensionPreferences.blockedNumbers != undefined) {
		if(extensionPreferences.blockedNumbers)
			extensionConfig.contactsBlockedNumbers = 1;
		else
			extensionConfig.contactsBlockedNumbers = 0;
	}

	if(extensionPreferences.unknownNumbers != undefined) {
		if(extensionPreferences.unknownNumbers)
			extensionConfig.contactsUnknownNumbers = 1;
		else
			extensionConfig.contactsUnknownNumbers = 0;
	}

	return extensionConfig;
}

ContactsSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};
	
	if(extensionConfig.contactsDatabaseId != -1)
		extensionPreferences.databaseId = extensionConfig.contactsDatabaseId;
	
	if(extensionConfig.contactsBlockedNumbers != -1) {
		if(extensionConfig.contactsBlockedNumbers == 1)
			extensionPreferences.blockedNumbers = true;
		else
			extensionPreferences.blockedNumbers = false;
	}

	if(extensionConfig.contactsUnknownNumbers != -1) {
		if(extensionConfig.contactsUnknownNumbers == 1)
			extensionPreferences.unknownNumbers = true;
		else
			extensionPreferences.unknownNumbers = false;
	}

	return extensionPreferences;
}

//

ContactsSettings.prototype.export = function(extensionPreferences) {
}

ContactsSettings.prototype.import = function(extensionPreferences, doneCallback) {
	doneCallback();
}

//

ContactsSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "ContactsBlockedHelp") {
		var helpTitle = "Blocked";

		var helpText = "Determines whether blocked numbers should be handled as unknown contacts.";
	}
	else if(event.originalEvent.target.id == "ContactsUnknownHelp") {
		var helpTitle = "Unknown";

		var helpText = "Determines whether unknown numbers should be handled as unknown contacts.";
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

ContactsSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);

	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.contacts", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.app.contacts.prefs:1"}}}, 
			'onComplete': requestCallback});
	}
	else
		doneCallback(extensionConfig);
}

ContactsSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if(serviceResponse.returnValue) {
		if(requestID == 0) {
			if(serviceResponse.results.length > 0) {
				extensionConfig.contactsDatabaseId = serviceResponse.results[0]._id;
			
				extensionConfig.contactsBlockedNumbers = 0;
				extensionConfig.contactsUnknownNumbers = 0;
							
				if(serviceResponse.results[0].blockedNumbers)
					extensionConfig.contactsBlockedNumbers = 1;
				
				if(serviceResponse.results[0].unknownNumbers)
					extensionConfig.contactsUnknownNumbers = 1;
			}
		}
	}
	
	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

