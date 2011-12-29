function EmailSettings(controller) {
	this.controller = controller;
}

//

EmailSettings.prototype.basic = function() {
	return false;
}

//

EmailSettings.prototype.label = function() {
	return $L("Email Settings");
}

//

EmailSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;

	this.defaultAccountId = 0;

	if(!this.accountSelectorChoices) {
		this.accountSelectorChoices = [
			{'label': $L("No email accounts"), 'value': -1} ];
	}

	this.choicesEmailAccountSelector = this.accountSelectorChoices;

	this.controller.setupWidget("EmailAccountSelector", { 
		'labelPlacement': "right", 'modelProperty': "emailAccountId",
		'choices': this.choicesEmailAccountSelector});

	this.choicesEmailBlinkSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("EmailBlinkSelector", {'label': $L("Blink"), 
		'labelPlacement': "left", 'modelProperty': "emailBlinkNotify",
		'choices': this.choicesEmailBlinkSelector});

	this.choicesEmailAlertSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("System Sound"), 'value': 1},
		{'label': $L("Ringtone"), 'value': 2},
		{'label': $L("Vibrate"), 'value': 3},
		{'label': $L("Mute"), 'value': 0} ];  

	this.controller.setupWidget("EmailAlertSelector", {'label': $L("Alert"), 
		'labelPlacement': "left", 'modelProperty': "emailNotifyAlert",
		'choices': this.choicesEmailAlertSelector});

	this.choicesEmailRingtoneSelector = [
		{'label': defaultChoiseLabel, 'value': ""},
		{'label': $L("Select"), 'value': "select"} ];  

	this.controller.setupWidget("EmailRingtoneSelector", {'label': $L("Ringtone"), 
		'labelPlacement': "left", 'modelProperty': "emailRingtoneName",
		'choices': this.choicesEmailRingtoneSelector});

	this.choicesEmailSyncSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("As Items Arrive"), 'value': 1000000}, 
		{'label': "5 " + $L("Minutes"), 'value': 5},
		{'label': "10 " + $L("Minutes"), 'value': 10},
		{'label': "15 " + $L("Minutes"), 'value': 15},
		{'label': "30 " + $L("Minutes"), 'value': 30},
		{'label': "1 " + $L("Hour"), 'value': 60},
		{'label': "6 " + $L("Hours"), 'value': 360},		
		{'label': "12 " + $L("Hours"), 'value': 720},
		{'label': "24 " + $L("Hours"), 'value': 1440},		
		{'label': $L("Manual"), 'value': 0} ];

	this.controller.setupWidget("EmailSyncSelector", {'label': $L("Get Email"), 
		'labelPlacement': "left", 'modelProperty': "emailSyncInterval",
		'choices': this.choicesEmailSyncSelector});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	// Listen for change event for ringtone selector
	
	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
}

//

EmailSettings.prototype.config = function() {
	if(!this.accountSelectorChoices) {
		this.accountSelectorChoices = [
			{'label': $L("No email accounts"), 'value': -1} ];
	}
	
	var extensionConfig = {
		'emailTitle': $L("Email"),
		'emailAccountRow': "single",
		'emailBlinkDisplay': "none",
		'emailAlertDisplay': "none", 		
		'emailRingtoneDisplay': "none", 
		'emailSyncDisplay': "none", 
		'emailCurrentId': -1,
		'emailAccountId': -1,
		'emailBlinkNotify': -1, 
		'emailNotifyAlert': -1, 
		'emailRingtoneName': -1, 
		'emailRingtonePath': -1,
		'emailSyncInterval': -1,
		'emailAccounts': {},		
		'emailAccountsCfg': [],
		'emailBlinkNotifyCfg': {}, 
		'emailNotifyAlertCfg': {}, 
		'emailRingtoneNameCfg': {}, 
		'emailRingtonePathCfg': {},
		'emailSyncIntervalCfg': {} };
	
	return extensionConfig;
}

//

EmailSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();
	
	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

EmailSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();

	if(extensionPreferences.accounts != undefined) {
		for(var accId in extensionPreferences.accounts) {
			if(extensionPreferences.accounts[accId].isDefault == true) {
				extensionConfig.emailAccountsCfg.unshift({
					accountId: accId,
					isDefault: extensionPreferences.accounts[accId].isDefault,
					databaseId: extensionPreferences.accounts[accId].databaseId,
					identifier: extensionPreferences.accounts[accId].identifier });
			}
			else {
				extensionConfig.emailAccountsCfg.push({
					accountId: accId,
					isDefault: extensionPreferences.accounts[accId].isDefault,
					databaseId: extensionPreferences.accounts[accId].databaseId,
					identifier: extensionPreferences.accounts[accId].identifier });
			}
		}

		for(var i = 0; i < extensionConfig.emailAccountsCfg.length; i++) {
			var accId = extensionConfig.emailAccountsCfg[i].accountId;
		
			if(i == 0) {
				this.accountSelectorChoices.clear();

				extensionConfig.emailAccountId = accId;
				extensionConfig.emailCurrentId = accId;				
			}

			extensionConfig.emailBlinkNotifyCfg[accId] = -1;
			extensionConfig.emailNotifyAlertCfg[accId] = -1;
			extensionConfig.emailRingtoneNameCfg[accId] = "";
			extensionConfig.emailRingtonePathCfg[accId] = "";
			extensionConfig.emailSyncIntervalCfg[accId] = -1;
									
			if(extensionPreferences.blinkNotify[accId] != undefined) {
				if(extensionPreferences.blinkNotify[accId])
					extensionConfig.emailBlinkNotifyCfg[accId] = 1;
				else
					extensionConfig.emailBlinkNotifyCfg[accId] = 0;
			}

			if(extensionPreferences.notifyAlert[accId] != undefined) {
				if(extensionPreferences.notifyAlert[accId] == "system")
					extensionConfig.emailNotifyAlertCfg[accId] = 1;
				else if(extensionPreferences.notifyAlert[accId] == "ringtone")
					extensionConfig.emailNotifyAlertCfg[accId] = 2;
				else if(extensionPreferences.notifyAlert[accId] == "vibrate")
					extensionConfig.emailNotifyAlertCfg[accId] = 3;
				else
					extensionConfig.emailNotifyAlertCfg[accId] = 0;
			}
			
			if(extensionPreferences.ringtoneName[accId] != undefined)
				extensionConfig.emailRingtoneNameCfg[accId] = extensionPreferences.ringtoneName[accId];

			if(extensionPreferences.ringtonePath[accId] != undefined)
				extensionConfig.emailRingtonePathCfg[accId] = extensionPreferences.ringtonePath[accId];

			if(extensionPreferences.syncInterval[accId] != undefined) {
				if(extensionPreferences.syncInterval[accId] == -1)
					extensionConfig.emailSyncIntervalCfg[accId] = 1000000;
				else
					extensionConfig.emailSyncIntervalCfg[accId] = extensionPreferences.syncInterval[accId];
			}
			
			this.accountSelectorChoices.push({
				'label': extensionConfig.emailAccountsCfg[i].identifier, 
				'value': extensionConfig.emailAccountsCfg[i].accountId });
		}

		extensionConfig.emailBlinkNotify = extensionConfig.emailBlinkNotifyCfg[extensionConfig.emailCurrentId];
		extensionConfig.emailNotifyAlert = extensionConfig.emailNotifyAlertCfg[extensionConfig.emailCurrentId];
		extensionConfig.emailRingtoneName = extensionConfig.emailRingtoneNameCfg[extensionConfig.emailCurrentId];		
		extensionConfig.emailRingtonePath = extensionConfig.emailRingtonePathCfg[extensionConfig.emailCurrentId];
		extensionConfig.emailSyncInterval = extensionConfig.emailSyncIntervalCfg[extensionConfig.emailCurrentId];

		extensionConfig.emailAccountRow = "first";				
		extensionConfig.emailBlinkDisplay = "block";
		extensionConfig.emailSyncDisplay = "block";

		extensionConfig.emailAlertDisplay = "none";
		extensionConfig.emailRingtoneDisplay = "none";
		
		extensionConfig.emailAlertDisplay = "block";				

		if((extensionConfig.emailNotifyAlert == -1) || (extensionConfig.emailNotifyAlert == 2))
			extensionConfig.emailRingtoneDisplay = "block";	
	}
	
	return extensionConfig;
}

EmailSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};
	
	if(extensionConfig.emailAccountsCfg.length > 0) {
		extensionConfig.emailBlinkNotifyCfg[extensionConfig.emailCurrentId] = extensionConfig.emailBlinkNotify;
		extensionConfig.emailNotifyAlertCfg[extensionConfig.emailCurrentId] = extensionConfig.emailNotifyAlert;
		extensionConfig.emailRingtoneNameCfg[extensionConfig.emailCurrentId] = extensionConfig.emailRingtoneName;
		extensionConfig.emailRingtonePathCfg[extensionConfig.emailCurrentId] = extensionConfig.emailRingtonePath;
		extensionConfig.emailSyncIntervalCfg[extensionConfig.emailCurrentId] = extensionConfig.emailSyncInterval;

		extensionPreferences.accounts = {};

		for(var i = 0; i < extensionConfig.emailAccountsCfg.length; i++) {
			var accId = extensionConfig.emailAccountsCfg[i].accountId;
			
			extensionPreferences.accounts[accId] = {
				isDefault: extensionConfig.emailAccountsCfg[i].isDefault,
				databaseId: extensionConfig.emailAccountsCfg[i].databaseId,
				identifier: extensionConfig.emailAccountsCfg[i].identifier };
		}

		extensionPreferences.blinkNotify = {};
		extensionPreferences.notifyAlert = {};
		extensionPreferences.ringtoneName = {};
		extensionPreferences.ringtonePath = {};
		extensionPreferences.syncInterval = {};

		for(var i = 0; i < extensionConfig.emailAccountsCfg.length; i++) {
			var accId = extensionConfig.emailAccountsCfg[i].accountId;

			if(extensionConfig.emailBlinkNotifyCfg[accId] != -1) {
				if(extensionConfig.emailBlinkNotifyCfg[accId] == 1)
					extensionPreferences.blinkNotify[accId] = true;
				else
					extensionPreferences.blinkNotify[accId] = false;
			}
			
			if(extensionConfig.emailNotifyAlertCfg[accId] != -1) {
				if(extensionConfig.emailNotifyAlertCfg[accId] == 1)
					extensionPreferences.notifyAlert[accId] = "system";
				else if(extensionConfig.emailNotifyAlertCfg[accId] == 2)
					extensionPreferences.notifyAlert[accId] = "ringtone";
				else if(extensionConfig.emailNotifyAlertCfg[accId] == 3)
					extensionPreferences.notifyAlert[accId] = "vibrate";
				else
					extensionPreferences.notifyAlert[accId] = "mute";
			}
				
			if(extensionConfig.emailRingtoneNameCfg[accId] != "")
				extensionPreferences.ringtoneName[accId] = extensionConfig.emailRingtoneNameCfg[accId];

			if(extensionConfig.emailRingtonePathCfg[accId] != "")
				extensionPreferences.ringtonePath[accId] = extensionConfig.emailRingtonePathCfg[accId];

			if(extensionConfig.emailSyncIntervalCfg[accId] != -1) {
				if(extensionConfig.emailSyncIntervalCfg[accId] == 1000000)
					extensionPreferences.syncInterval[accId] = -1;
				else
					extensionPreferences.syncInterval[accId] = parseInt(extensionConfig.emailSyncIntervalCfg[accId]);
			}
		}
	}
	
	return extensionPreferences;
}

//

EmailSettings.prototype.export = function(extensionPreferences) {
	if(extensionPreferences.accounts) {
		var isFirstAccount = true;
	
		for(var accId in extensionPreferences.accounts) {
			if((isFirstAccount == true) || 
				(extensionPreferences.accounts[accId].isDefault == true))
			{
				isFirstAccount = false;
			
				if(extensionPreferences.blinkNotify[accId] != undefined)
					extensionPreferences.blinkNotify = {'default': extensionPreferences.blinkNotify[accId]};

				if(extensionPreferences.notifyAlert[accId] != undefined)
					extensionPreferences.notifyAlert = {'default': extensionPreferences.notifyAlert[accId]};

				if(extensionPreferences.ringtoneName[accId] != undefined)
					extensionPreferences.ringtoneName = {'default': extensionPreferences.ringtoneName[accId]};

				if(extensionPreferences.ringtonePath[accId] != undefined)
					extensionPreferences.ringtonePath = {'default': extensionPreferences.ringtonePath[accId]};

				if(extensionPreferences.syncInterval[accId] != undefined)
					extensionPreferences.syncInterval = {'default': extensionPreferences.syncInterval[accId]};
			}

			if(extensionPreferences.blinkNotify[accId] != undefined)			
				delete extensionPreferences.blinkNotify[accId];
			
			if(extensionPreferences.notifyAlert[accId] != undefined)			
				delete extensionPreferences.notifyAlert[accId];

			if(extensionPreferences.ringtoneName[accId] != undefined)			
				delete extensionPreferences.ringtoneName[accId];

			if(extensionPreferences.ringtonePath[accId] != undefined)			
				delete extensionPreferences.ringtonePath[accId];

			if(extensionPreferences.syncInterval[accId] != undefined)			
				delete extensionPreferences.syncInterval[accId];
		}
	
		delete extensionPreferences.accounts;
		
		extensionPreferences.accounts = {};
	}	
}

EmailSettings.prototype.import = function(extensionPreferences, doneCallback) {
	if(extensionPreferences.accounts) {
		var extensionConfig = this.config();
	
		var callback = this.gotSystemSettings.bind(this, extensionPreferences, doneCallback);
	
		this.getSystemSettings(0, extensionConfig, callback);
	}
	else
		doneCallback();
}

//

EmailSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "EmailAccountHelp") {
		var helpTitle = "Account Selector";

		var helpText = "This only selects the account for which the settings are shown below. Note that the account settings wont get updated automatically if you add new accounts. You need to re-add the settings into your modes for the new accounts to show up.";
	}
	else if(event.originalEvent.target.id == "EmailBlinkHelp") {
		var helpTitle = "Blink";

		var helpText = "Email blink notification setting. When enabled, the gesture area blinks when there is new emails.";
	}
	else if(event.originalEvent.target.id == "EmailAlertHelp") {
		var helpTitle = "Alert";

		var helpText = "Email notification alert setting. The sound alert type for new email notification.";
	}
	else if(event.originalEvent.target.id == "EmailRingtoneHelp") {
		var helpTitle = "Ringtone";

		var helpText = "Email notification ringtone setting. The ringtone for new email notification alert.";
	}
	else if(event.originalEvent.target.id == "EmailSyncHelp") {
		var helpTitle = "Get Email";

		var helpText = "Email synchronization setting. The interval configuration for checking new emails.";
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

EmailSettings.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "emailAccountId") {
		changeEvent.model.emailBlinkNotify = changeEvent.model.emailBlinkNotifyCfg[changeEvent.value];
		changeEvent.model.emailNotifyAlert = changeEvent.model.emailNotifyAlertCfg[changeEvent.value];
		changeEvent.model.emailRingtoneName = changeEvent.model.emailRingtoneNameCfg[changeEvent.value];
		changeEvent.model.emailRingtonePath = changeEvent.model.emailRingtonePathCfg[changeEvent.value];
		changeEvent.model.emailSyncInterval = changeEvent.model.emailSyncIntervalCfg[changeEvent.value];
		
		changeEvent.model.emailRingtoneDisplay = "none";

		if((changeEvent.model.emailNotifyAlert == -1) || (changeEvent.model.emailNotifyAlert == 2))
			changeEvent.model.emailRingtoneDisplay = "block";	
		
		changeEvent.model.emailCurrentId = changeEvent.model.emailAccountId;

		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
	else if(changeEvent.property == "emailNotifyAlert") {
		changeEvent.model.emailRingtoneDisplay = "none";
		
		if((changeEvent.value == -1) || (changeEvent.value == 2))
			changeEvent.model.emailRingtoneDisplay = "block";
		
		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
	else if(changeEvent.property == "emailRingtoneName") {
		changeEvent.model.emailRingtoneName = "";		
		changeEvent.model.emailRingtonePath = "";		
	
		if(changeEvent.value == "select") {
			this.executeRingtoneSelect(changeEvent.model);
		}
		
		this.controller.modelChanged(changeEvent.model, this);
	}
}

//

EmailSettings.prototype.executeRingtoneSelect = function(eventModel) {
	Mojo.FilePicker.pickFile({'defaultKind': "ringtone", 'kinds': ["ringtone"], 
		'actionType': "attach", 'actionName': $L("Done"), 'onSelect': 
			function(eventModel, serviceResponse) {
				eventModel.emailRingtoneName = serviceResponse.name;
				eventModel.emailRingtonePath = serviceResponse.fullPath;
				
				this.controller.modelChanged(eventModel, this);
			}.bind(this, eventModel)},
		this.controller.stageController);
}

//

EmailSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);

	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.email", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.app.email.prefs:1"}}}, 
			'onComplete': requestCallback});	
	}
	else if(requestID == 1) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.email", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.account:1"}}}, 
			'onComplete': requestCallback});	
	}
	else if(requestID == 2) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.email", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.mail.account:1"}}}, 
			'onComplete': requestCallback});	
	}
	else
		doneCallback(extensionConfig);
}

EmailSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if(serviceResponse.returnValue) {
		if(requestID == 0) {
			if((serviceResponse.results) && (serviceResponse.results.length > 0) && 
				(serviceResponse.results[0].defaultAccountId != undefined))
			{
				this.defaultAccountId = serviceResponse.results[0].defaultAccountId;
			}
		} 
		else if(requestID == 1) {
			for(var i = 0; i < serviceResponse.results.length; i++) {
				for(var j = 0; j < serviceResponse.results[i].capabilityProviders.length; j++) {
					if(serviceResponse.results[i].capabilityProviders[j].capability == "MAIL")
						extensionConfig.emailAccounts[serviceResponse.results[i]._id] = serviceResponse.results[i].alias;
				}
			}			
		}
		else if(requestID == 2) {
			for(var i = 0; i < serviceResponse.results.length; i++) {
				var accId = serviceResponse.results[i].accountId;
				
				extensionConfig.emailBlinkNotifyCfg[accId] = 0;
				extensionConfig.emailNotifyAlertCfg[accId] = 0;
				extensionConfig.emailRingtoneNameCfg[accId] = "";
				extensionConfig.emailRingtonePathCfg[accId] = "";
				extensionConfig.emailSyncIntervalCfg[accId] = 15;								
				
				if((serviceResponse.results[i].notifications) && (serviceResponse.results[i].notifications.blink))
					extensionConfig.emailBlinkNotifyCfg[accId] = true;
				
				if((serviceResponse.results[i].notifications) && (serviceResponse.results[i].notifications.type)){
					if(serviceResponse.results[i].notifications.type == "system")
						extensionConfig.emailNotifyAlertCfg[accId] = 1;
					else if(serviceResponse.results[i].notifications.type == "ringtone") {
						extensionConfig.emailNotifyAlertCfg[accId] = 2;

						if((serviceResponse.results[i].notifications.ringtonePath) &&
							(serviceResponse.results[i].notifications.ringtonePath.length > 0))
						{
							extensionConfig.emailRingtoneNameCfg[accId] = serviceResponse.results[i].notifications.ringtoneName;
							extensionConfig.emailRingtonePathCfg[accId] = serviceResponse.results[i].notifications.ringtonePath;												
						}
					}
					else if(serviceResponse.results[i].notifications.type == "vibrate")
						extensionConfig.emailNotifyAlertCfg[accId] = 3;					
				}
				
				if(serviceResponse.results[i].syncFrequencyMins == -1)
					extensionConfig.emailSyncIntervalCfg[accId] = 1000000;
				else
					extensionConfig.emailSyncIntervalCfg[accId] = serviceResponse.results[i].syncFrequencyMins;

				if((i == 0) && (this.accountSelectorChoices))
					this.accountSelectorChoices.clear();

				if(accId == this.defaultAccountId) {
					extensionConfig.emailAccountsCfg.unshift({
						'databaseId': serviceResponse.results[i]._id,
						'isDefault' : true,
						'accountId': serviceResponse.results[i].accountId,
						'identifier': extensionConfig.emailAccounts[accId] + " - " + serviceResponse.results[i].username });

					if(this.accountSelectorChoices) {
						this.accountSelectorChoices.unshift({
							'label': extensionConfig.emailAccounts[accId] + " - " + serviceResponse.results[i].username, 
							'value': serviceResponse.results[i].accountId });
					}
				}
				else {
					extensionConfig.emailAccountsCfg.push({
						'databaseId': serviceResponse.results[i]._id,
						'isDefault' : false,
						'accountId': serviceResponse.results[i].accountId,
						'identifier': extensionConfig.emailAccounts[accId] + " - " + serviceResponse.results[i].username });

					if(this.accountSelectorChoices) {
						this.accountSelectorChoices.push({
							'label': extensionConfig.emailAccounts[accId] + " - " + serviceResponse.results[i].username, 
							'value': serviceResponse.results[i].accountId });
					}
				}
			}
			
			if(extensionConfig.emailAccountsCfg.length > 0) {
				var accId = extensionConfig.emailAccountsCfg[0].accountId;
			
				extensionConfig.emailAccountId = accId;
				extensionConfig.emailCurrentId = accId;

				extensionConfig.emailAccountRow = "first";				
				extensionConfig.emailBlinkDisplay = "block";
				extensionConfig.emailSyncDisplay = "block";
									
				extensionConfig.emailBlinkNotify = extensionConfig.emailBlinkNotifyCfg[accId];
				extensionConfig.emailNotifyAlert = extensionConfig.emailNotifyAlertCfg[accId];					
				extensionConfig.emailRingtoneName = extensionConfig.emailRingtoneNameCfg[accId];					
				extensionConfig.emailRingtonePath = extensionConfig.emailRingtonePathCfg[accId];					
				extensionConfig.emailSyncInterval = extensionConfig.emailSyncIntervalCfg[accId];					
				
				extensionConfig.emailAlertDisplay = "block";				

				if((extensionConfig.emailNotifyAlert == -1) || (extensionConfig.emailNotifyAlert == 2))
					extensionConfig.emailRingtoneDisplay = "block";
			}
		}
	}

	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

//

EmailSettings.prototype.gotSystemSettings = function(extensionPreferences, doneCallback, extensionConfig) {
	for(var i = 0; i < extensionConfig.emailAccountsCfg.length; i++) {
		var accId = extensionConfig.emailAccountsCfg[i].accountId;
		
		extensionPreferences.accounts[accId] = {
			isDefault: extensionConfig.emailAccountsCfg[i].isDefault,
			databaseId: extensionConfig.emailAccountsCfg[i].databaseId,
			identifier: extensionConfig.emailAccountsCfg[i].identifier };
		
		if(extensionPreferences.blinkNotify["default"] != undefined)
			extensionPreferences.blinkNotify[accId] = extensionPreferences.blinkNotify["default"];

		if(extensionPreferences.notifyAlert["default"] != undefined)
			extensionPreferences.notifyAlert[accId] = extensionPreferences.notifyAlert["default"];

		if(extensionPreferences.ringtoneName["default"] != undefined)
			extensionPreferences.ringtoneName[accId] = extensionPreferences.ringtoneName["default"];

		if(extensionPreferences.ringtonePath["default"] != undefined)
			extensionPreferences.ringtonePath[accId] = extensionPreferences.ringtonePath["default"];

		if(extensionPreferences.syncInterval["default"] != undefined)
			extensionPreferences.syncInterval[accId] = extensionPreferences.syncInterval["default"];
	}

	if(extensionPreferences.blinkNotify["default"] != undefined)
		delete extensionPreferences.blinkNotify["default"];

	if(extensionPreferences.notifyAlert["default"] != undefined)
		delete extensionPreferences.notifyAlert["default"];

	if(extensionPreferences.ringtoneName["default"] != undefined)
		delete extensionPreferences.ringtoneName["default"];

	if(extensionPreferences.ringtonePath["default"] != undefined)
		delete extensionPreferences.ringtonePath["default"];

	if(extensionPreferences.syncInterval["default"] != undefined)
		delete extensionPreferences.syncInterval["default"];

	doneCallback();
}

