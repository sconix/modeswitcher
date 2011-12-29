function MessagingSettings(controller) {
	this.controller = controller;
}

//

MessagingSettings.prototype.basic = function() {
	return false;
}

//

MessagingSettings.prototype.label = function() {
	return $L("Messaging Settings");
}

//

MessagingSettings.prototype.setup = function(controller, defaultChoiseLabel) {
	this.controller = controller;

	if(!this.accountSelectorChoices) {
		this.accountSelectorChoices = [
			{'label': $L("No messaging accounts"), 'value': -1} ];
	}
	
	this.choicesMsgAccountSelector = this.accountSelectorChoices;

	this.controller.setupWidget("MessagingAccountSelector", { 
		'labelPlacement': "right", 'modelProperty': "messagingAccountId",
		'choices': this.choicesMsgAccountSelector});

	this.choicesMsgBlinkSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Enabled"), 'value': 1},
		{'label': $L("Disabled"), 'value': 0} ];  

	this.controller.setupWidget("MessagingBlinkSelector", {'label': $L("Blink"), 
		'labelPlacement': "left", 'modelProperty': "messagingBlinkNotify",
		'choices': this.choicesMsgBlinkSelector});

	this.choicesMsgAlertSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("System Sound"), 'value': 1},
		{'label': $L("Ringtone"), 'value': 2},
		{'label': $L("Vibrate"), 'value': 3},
		{'label': $L("Mute"), 'value': 0} ];  

	this.controller.setupWidget("MessagingAlertSelector", {'label': $L("Alert"), 
		'labelPlacement': "left", 'modelProperty': "messagingNotifyAlert",
		'choices': this.choicesMsgAlertSelector});

	this.choicesMsgRingtoneSelector = [
		{'label': defaultChoiseLabel, 'value': ""},
		{'label': $L("Select"), 'value': "select"} ];  

	this.controller.setupWidget("MessagingRingtoneSelector", {'label': $L("Ringtone"), 
		'labelPlacement': "left", 'modelProperty': "messagingRingtoneName",
		'choices': this.choicesMsgRingtoneSelector});

	this.choicesIMStatusSelector = [
		{'label': defaultChoiseLabel, 'value': -1},
		{'label': $L("Available"), 'value': 0},
		{'label': $L("Busy"), 'value': 2},
		{'label': $L("Invisible"), 'value': 3},
		{'label': $L("Sign Off"), 'value': 4} ];

	this.controller.setupWidget("MessagingIMStatusSelector", {'label': $L("IM Status"), 
		'labelPlacement': "left", 'modelProperty': "messagingAvailability",
		'choices': this.choicesIMStatusSelector});

	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	// Listen for change event for ringtone selector
	
	this.controller.listen(this.controller.get("SettingsList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
}

//

MessagingSettings.prototype.config = function() {
	if(!this.accountSelectorChoices) {
		this.accountSelectorChoices = [
			{'label': $L("No messaging accounts"), 'value': -1} ];
	}

	var extensionConfig = {
		'messagingTitle': $L("Messaging"),
		'messagingAccountRow': "single",
		'messagingAlertRow': "last",
		'messagingRingtoneRow': "last",
		'messagingBlinkDisplay': "none",
		'messagingAlertDisplay': "none",
		'messagingRingtoneDisplay': "none",
		'messagingStatusDisplay': "none",
		'messagingCurrentId': -1,
		'messagingAccountId': -1,
		'messagingBlinkNotify': -1,
		'messagingNotifyAlert': -1, 
		'messagingRingtoneName': "", 
		'messagingRingtonePath': "",
		'messagingAvailability': -1,
		'messagingAccounts': {},
		'messagingNotifications': {},
		'messagingAccountsCfg': [],
		'messagingBlinkNotifyCfg': {},
		'messagingNotifyAlertCfg': {},
		'messagingRingtoneNameCfg': {},
		'messagingRingtonePathCfg': {},
		'messagingAvailabilityCfg': {} };
	
	return extensionConfig;
}

//

MessagingSettings.prototype.fetch = function(doneCallback) {
	var extensionConfig = this.config();
	
	this.getSystemSettings(0, extensionConfig, doneCallback);
}

//

MessagingSettings.prototype.load = function(extensionPreferences) {
	var extensionConfig = this.config();

	if(extensionPreferences.accounts != undefined) {
		for(var accId in extensionPreferences.accounts) {
			if(accId == "sms") {
				extensionConfig.messagingAccountsCfg.unshift({
					accountId: accId, 
					databaseId: extensionPreferences.accounts[accId].databaseId,
					serviceName: extensionPreferences.accounts[accId].serviceName,
					identifier: extensionPreferences.accounts[accId].identifier });
			}
			else {
				extensionConfig.messagingAccountsCfg.push({
					accountId: accId, 
					databaseId: extensionPreferences.accounts[accId].databaseId,
					serviceName: extensionPreferences.accounts[accId].serviceName,
					identifier: extensionPreferences.accounts[accId].identifier });
			}
		}
		
		if(this.accountSelectorChoices)
			this.accountSelectorChoices.clear();
	
		for(var i = 0; i < extensionConfig.messagingAccountsCfg.length; i++) {
			var accId = extensionConfig.messagingAccountsCfg[i].accountId;

			if(i == 0) {
				extensionConfig.messagingAccountId = accId;
				extensionConfig.messagingCurrentId = accId;				
			}

			extensionConfig.messagingBlinkNotifyCfg[accId] = -1;
			extensionConfig.messagingNotifyAlertCfg[accId] = -1;
			extensionConfig.messagingRingtoneNameCfg[accId] = "";
			extensionConfig.messagingRingtonePathCfg[accId] = "";

			if(extensionPreferences.blinkNotify[accId] != undefined) {
				if(extensionPreferences.blinkNotify[accId])
					extensionConfig.messagingBlinkNotifyCfg[accId] = 1;
				else
					extensionConfig.messagingBlinkNotifyCfg[accId] = 0;
			}
			
			if(extensionPreferences.notifyAlert[accId] != undefined) {
				if(extensionPreferences.notifyAlert[accId] == "alert")
					extensionConfig.messagingNotifyAlertCfg[accId] = 1;
				else if(extensionPreferences.notifyAlert[accId] == "ringtone")
					extensionConfig.messagingNotifyAlertCfg[accId] = 2;
				else if(extensionPreferences.notifyAlert[accId] == "vibrate")
					extensionConfig.messagingNotifyAlertCfg[accId] = 3;
				else
					extensionConfig.messagingNotifyAlertCfg[accId] = 0;
			}
			
			if(extensionPreferences.ringtoneName[accId] != undefined)
				extensionConfig.messagingRingtoneNameCfg[accId] = extensionPreferences.ringtoneName[accId];

			if(extensionPreferences.ringtonePath[accId] != undefined)
				extensionConfig.messagingRingtonePathCfg[accId] = extensionPreferences.ringtonePath[accId];

			if(extensionPreferences.availability[accId] != undefined)
				extensionConfig.messagingAvailabilityCfg[accId] = extensionPreferences.availability[accId];
		
			if(this.accountSelectorChoices) {
				this.accountSelectorChoices.push({
					'label': extensionConfig.messagingAccountsCfg[i].identifier, 
					'value': extensionConfig.messagingAccountsCfg[i].accountId });
			}
		}

		extensionConfig.messagingBlinkNotify = extensionConfig.messagingBlinkNotifyCfg[extensionConfig.messagingCurrentId];
		extensionConfig.messagingNotifyAlert = extensionConfig.messagingNotifyAlertCfg[extensionConfig.messagingCurrentId];
		extensionConfig.messagingRingtoneName = extensionConfig.messagingRingtoneNameCfg[extensionConfig.messagingCurrentId];		
		extensionConfig.messagingRingtonePath = extensionConfig.messagingRingtonePathCfg[extensionConfig.messagingCurrentId];
		
		if(extensionConfig.messagingAvailabilityCfg[extensionConfig.messagingCurrentId]!= undefined)
			extensionConfig.messagingAvailability = extensionConfig.messagingAvailabilityCfg[extensionConfig.messagingCurrentId];

		extensionConfig.messagingAccountRow = "first";				
		extensionConfig.messagingBlinkDisplay = "block";
		extensionConfig.messagingAlertDisplay = "block";
		extensionConfig.messagingRingtoneDisplay = "none";
		extensionConfig.messagingStatusDisplay = "none";

		if(extensionConfig.messagingAccountsCfg[0].accountId == "sms") {
			if((extensionConfig.messagingNotifyAlert == -1) || (extensionConfig.messagingNotifyAlert == 2))
				extensionConfig.messagingAlertRow = "";
		}
		else {
			extensionConfig.messagingAlertRow = "";
			extensionConfig.messagingRingtoneRow = "";
		}

		if((extensionConfig.messagingNotifyAlert == -1) || (extensionConfig.messagingNotifyAlert == 2))
			extensionConfig.messagingRingtoneDisplay = "block";	
	}

	return extensionConfig;
}

MessagingSettings.prototype.save = function(extensionConfig) {
	var extensionPreferences = {};

	if(extensionConfig.messagingAccountsCfg.length > 0) {
		extensionConfig.messagingBlinkNotifyCfg[extensionConfig.messagingCurrentId] = extensionConfig.messagingBlinkNotify;
		extensionConfig.messagingNotifyAlertCfg[extensionConfig.messagingCurrentId] = extensionConfig.messagingNotifyAlert;
		extensionConfig.messagingRingtoneNameCfg[extensionConfig.messagingCurrentId] = extensionConfig.messagingRingtoneName;
		extensionConfig.messagingRingtonePathCfg[extensionConfig.messagingCurrentId] = extensionConfig.messagingRingtonePath;
		
		if(extensionConfig.messagingAvailabilityCfg[extensionConfig.messagingCurrentId] != undefined)
			extensionConfig.messagingAvailabilityCfg[extensionConfig.messagingCurrentId] = extensionConfig.messagingAvailability;

		extensionPreferences.accounts = {};
		
		for(var i = 0; i < extensionConfig.messagingAccountsCfg.length; i++) {
			var accId = extensionConfig.messagingAccountsCfg[i].accountId;
		
			extensionPreferences.accounts[accId] = {
				databaseId: extensionConfig.messagingAccountsCfg[i].databaseId,
				serviceName: extensionConfig.messagingAccountsCfg[i].serviceName,
				identifier: extensionConfig.messagingAccountsCfg[i].identifier };
		}

		extensionPreferences.blinkNotify = {};
		extensionPreferences.notifyAlert = {};
		extensionPreferences.ringtoneName = {};
		extensionPreferences.ringtonePath = {};
		extensionPreferences.availability = {};

		for(var i = 0; i < extensionConfig.messagingAccountsCfg.length; i++) {
			var accId = extensionConfig.messagingAccountsCfg[i].accountId;

			if(extensionConfig.messagingBlinkNotifyCfg[accId] != -1) {
				if(extensionConfig.messagingBlinkNotifyCfg[accId] == 1)
					extensionPreferences.blinkNotify[accId] = true;
				else
					extensionPreferences.blinkNotify[accId] = false;				
			}

			if(extensionConfig.messagingNotifyAlertCfg[accId] != -1) {
				if(extensionConfig.messagingNotifyAlertCfg[accId] == 1)
					extensionPreferences.notifyAlert[accId] = "alert";
				else if(extensionConfig.messagingNotifyAlertCfg[accId] == 2)
					extensionPreferences.notifyAlert[accId] = "ringtone";
				else if(extensionConfig.messagingNotifyAlertCfg[accId] == 3)
					extensionPreferences.notifyAlert[accId] = "vibrate";
				else
					extensionPreferences.notifyAlert[accId] = "mute";
			}

			if(extensionConfig.messagingRingtoneNameCfg[accId] != "")
				extensionPreferences.ringtoneName[accId] = extensionConfig.messagingRingtoneNameCfg[accId];

			if(extensionConfig.messagingRingtonePathCfg[accId] != "")
				extensionPreferences.ringtonePath[accId] = extensionConfig.messagingRingtonePathCfg[accId];

			if((extensionConfig.messagingAvailabilityCfg[accId] != undefined) && 
				(extensionConfig.messagingAvailabilityCfg[accId] != -1))
			{
				extensionPreferences.availability[accId] = parseInt(extensionConfig.messagingAvailabilityCfg[accId]);
			}
		}
	}
	
	return extensionPreferences;
}

//

MessagingSettings.prototype.export = function(extensionPreferences) {
	if(extensionPreferences.accounts) {
		var isFirstAccount = true;
	
		for(var accId in extensionPreferences.accounts) {
			if(accId != "sms") {
				if(isFirstAccount) {
					isFirstAccount = false;

					if(extensionPreferences.blinkNotify[accId] != undefined)
						extensionPreferences.blinkNotify["im"] = extensionPreferences.blinkNotify[accId];

					if(extensionPreferences.notifyAlert[accId] != undefined)
						extensionPreferences.notifyAlert["im"] = extensionPreferences.notifyAlert[accId];

					if(extensionPreferences.ringtoneName[accId] != undefined)
						extensionPreferences.ringtoneName["im"] = extensionPreferences.ringtoneName[accId];

					if(extensionPreferences.ringtonePath[accId] != undefined)
						extensionPreferences.ringtonePath["im"] = extensionPreferences.ringtonePath[accId];

					if(extensionPreferences.availability[accId] != undefined)
						extensionPreferences.availability["im"] = extensionPreferences.availability[accId];
				}
				if(extensionPreferences.blinkNotify[accId] != undefined)			
					delete extensionPreferences.blinkNotify[accId];
			
				if(extensionPreferences.notifyAlert[accId] != undefined)			
					delete extensionPreferences.notifyAlert[accId];

				if(extensionPreferences.ringtoneName[accId] != undefined)			
					delete extensionPreferences.ringtoneName[accId];

				if(extensionPreferences.ringtonePath[accId] != undefined)			
					delete extensionPreferences.ringtonePath[accId];

				if(extensionPreferences.availability[accId] != undefined)			
					delete extensionPreferences.availability[accId];
			}
		}
	
		delete extensionPreferences.accounts;
		
		extensionPreferences.accounts = {};
	}
}

MessagingSettings.prototype.import = function(extensionPreferences, doneCallback) {
	if(extensionPreferences.accounts) {
		var extensionConfig = this.config();
	
		var callback = this.gotSystemSettings.bind(this, extensionPreferences, doneCallback);
	
		this.getSystemSettings(0, extensionConfig, callback);
	}
	else
		doneCallback();
}

//

MessagingSettings.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "MessagingAccountHelp") {
		var helpTitle = "Account Selector";

		var helpText = "This only selects the account for which the settings are shown below. Note that the account settings wont get updated automatically if you add new accounts. You need to re-add the settings into your modes for the new accounts to show up.";
	}
	else if(event.originalEvent.target.id == "MessagingBlinkHelp") {
		var helpTitle = "Blink";

		var helpText = "Message blink notification setting. When enabled, the gesture area blinks when there is new messages.";
	}
	else if(event.originalEvent.target.id == "MessagingAlertHelp") {
		var helpTitle = "Alert";

		var helpText = "Message notification alert setting. The sound alert type for new messages notification.";
	}
	else if(event.originalEvent.target.id == "MessagingRingtoneHelp") {
		var helpTitle = "Ringtone";

		var helpText = "Message notification ringtone setting. The ringtone for new messages notification alert.";
	}
	else if(event.originalEvent.target.id == "MessagingIMStatusHelp") {
		var helpTitle = "IM Status";

		var helpText = "Instant messaging status setting. Status setting for instant messaging accounts.";
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

MessagingSettings.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "messagingAccountId") {
		changeEvent.model.messagingBlinkNotify = changeEvent.model.messagingBlinkNotifyCfg[changeEvent.value];
		changeEvent.model.messagingNotifyAlert = changeEvent.model.messagingNotifyAlertCfg[changeEvent.value];
		changeEvent.model.messagingRingtoneName = changeEvent.model.messagingRingtoneNameCfg[changeEvent.value];
		changeEvent.model.messagingRingtonePath = changeEvent.model.messagingRingtonePathCfg[changeEvent.value];

		changeEvent.model.messagingAlertRow = "last";
		changeEvent.model.messagingRingtoneRow = "last";
		changeEvent.model.messagingStatusDisplay = "none";

		if(changeEvent.model.messagingAvailabilityCfg[changeEvent.value] != undefined) {
			changeEvent.model.messagingAlertRow = "";
			changeEvent.model.messagingRingtoneRow = "";
			changeEvent.model.messagingStatusDisplay = "block";

			changeEvent.model.messagingAvailability = changeEvent.model.messagingAvailabilityCfg[changeEvent.value];
		}
		
		changeEvent.model.messagingRingtoneDisplay = "none";
		
		if((changeEvent.model.messagingNotifyAlert == -1) || (changeEvent.model.messagingNotifyAlert == 2)){
			changeEvent.model.messagingAlertRow = "";		
			changeEvent.model.messagingRingtoneDisplay = "block";	
		}
		
		changeEvent.model.messagingCurrentId = changeEvent.model.messagingAccountId;

		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
	else if(changeEvent.property == "messagingNotifyAlert") {
		changeEvent.model.messagingAlertRow = "last";
		changeEvent.model.messagingRingtoneRow = "last";
		changeEvent.model.messagingRingtoneDisplay = "none";
		
		if(changeEvent.model.messagingAvailabilityCfg[changeEvent.model.messagingCurrentId] != undefined) {
			changeEvent.model.messagingAlertRow = "";
			changeEvent.model.messagingRingtoneRow = "";		
		}
		
		if((changeEvent.value == -1) || (changeEvent.value == 2)) {
			changeEvent.model.messagingAlertRow = "";
			changeEvent.model.messagingRingtoneDisplay = "block";
		}

		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("SettingsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
	else if(changeEvent.property == "messagingRingtoneName") {
		changeEvent.model.messagingRingtoneName = "";		
		changeEvent.model.messagingRingtonePath = "";		
		
		this.controller.modelChanged(changeEvent.model, this);

		if(changeEvent.value == "select") {
			this.executeRingtoneSelect(changeEvent.model);
		}
	}
}

//

MessagingSettings.prototype.executeRingtoneSelect = function(eventModel) {
	Mojo.FilePicker.pickFile({'defaultKind': "ringtone", 'kinds': ["ringtone"], 
		'actionType': "attach", 'actionName': "Done", 'onSelect': 
			function(eventModel, serviceResponse) {
				eventModel.messagingRingtoneName = serviceResponse.name;
				eventModel.messagingRingtonePath = serviceResponse.fullPath;
				
				this.controller.modelChanged(eventModel, this);
			}.bind(this, eventModel)},
		this.controller.stageController);
}

//

MessagingSettings.prototype.getSystemSettings = function(requestID, extensionConfig, doneCallback) {
	var requestCallback = this.handleGetResponse.bind(this, requestID, extensionConfig, doneCallback);

	if(requestID == 0) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.messaging", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.account:1"}}}, 
			'onComplete': requestCallback});	
	}
	else if(requestID == 1) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.messaging", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.app.messagingprefs:1"}}}, 
			'onComplete': requestCallback});		
	}
	else if(requestID == 2) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
			'parameters': {
				'id': "com.palm.app.messaging", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.imloginstate:1"}}}, 
			'onComplete': requestCallback});		
	}
	else
		doneCallback(extensionConfig);
}

MessagingSettings.prototype.handleGetResponse = function(requestID, extensionConfig, doneCallback, serviceResponse) {
	if(serviceResponse.returnValue) {
		if(requestID == 0) {
			for(var i = 0; i < serviceResponse.results.length; i++) {
				for(var j = 0; j < serviceResponse.results[i].capabilityProviders.length; j++) {
					if(serviceResponse.results[i].capabilityProviders[j].capability == "MESSAGING")
						extensionConfig.messagingAccounts[serviceResponse.results[i]._id] = serviceResponse.results[i].alias;
				}
			}			
		}
		else if(requestID == 1) {
			if(serviceResponse.results.length == 1) {
				extensionConfig.messagingAccountsCfg.clear();

				this.accountSelectorChoices.clear();

				extensionConfig.messagingBlinkNotifyCfg["sms"] = 0;
				extensionConfig.messagingNotifyAlertCfg["sms"] = 1;
				extensionConfig.messagingRingtoneNameCfg["sms"] = "";
				extensionConfig.messagingRingtonePathCfg["sms"] = "";

				extensionConfig.messagingAccountRow = "first";				
				extensionConfig.messagingBlinkDisplay = "block";
				extensionConfig.messagingAlertDisplay = "block";

				if(serviceResponse.results[0].blinkNotification)
					extensionConfig.messagingBlinkNotifyCfg["sms"] = 1;

				if(serviceResponse.results[0].notificationSound == "mute")
					extensionConfig.messagingNotifyAlertCfg["sms"] = 0;
				else if(serviceResponse.results[0].notificationSound == "alert")
					extensionConfig.messagingNotifyAlertCfg["sms"] = 1;			
				else if(serviceResponse.results[0].notificationSound == "ringtone") {
					extensionConfig.messagingAlertRow = "";	
					extensionConfig.messagingRingtoneDisplay = "block";

					extensionConfig.messagingNotifyAlertCfg["sms"] = 2;

					if((serviceResponse.results[0].ringtone) &&
						(serviceResponse.results[0].ringtone.path) &&
						(serviceResponse.results[0].ringtone.path.length > 0))
					{
						extensionConfig.messagingRingtoneNameCfg["sms"] = serviceResponse.results[0].ringtone.name;
						extensionConfig.messagingRingtonePathCfg["sms"] = serviceResponse.results[0].ringtone.path; 
					}
				}
				else if(serviceResponse.results[0].notificationSound == "vibrate")
					extensionConfig.messagingNotifyAlertCfg["sms"] = 3;

				extensionConfig.messagingAccountId = "sms";
				extensionConfig.messagingCurrentId = "sms";		

				extensionConfig.messagingBlinkNotify = extensionConfig.messagingBlinkNotifyCfg["sms"];
				extensionConfig.messagingNotifyAlert = extensionConfig.messagingNotifyAlertCfg["sms"];
				extensionConfig.messagingRingtoneName = extensionConfig.messagingRingtoneNameCfg["sms"];
				extensionConfig.messagingRingtonePath = extensionConfig.messagingRingtonePathCfg["sms"];

				extensionConfig.messagingNotifications = serviceResponse.results[0].accountNotifications;

				extensionConfig.messagingAccountsCfg.push({
					'databaseId': serviceResponse.results[0]._id,
					'accountId': "sms",
					'serviceName': "sms",
					'identifier': "SMS - Messaging account" });
				
				this.accountSelectorChoices.push({
					'label': "SMS - Messaging account", 
					'value': "sms" });
			}
			else {
				doneCallback(extensionConfig);

				return;
			}
		}
		else if(requestID == 2) {
			for(var i = 0; i < serviceResponse.results.length; i++) {
				var accId = serviceResponse.results[i].accountId;
				var sName = serviceResponse.results[i].serviceName;

				extensionConfig.messagingBlinkNotifyCfg[accId] = 0;
				extensionConfig.messagingNotifyAlertCfg[accId] = 1;
				extensionConfig.messagingRingtoneNameCfg[accId] = "";
				extensionConfig.messagingRingtonePathCfg[accId] = "";
				extensionConfig.messagingAvailabilityCfg[accId] = 4;
				
				if((extensionConfig.messagingNotifications) &&
					(extensionConfig.messagingNotifications[sName]))
				{
					if(extensionConfig.messagingNotifications[sName].blinkNotification)
						extensionConfig.messagingBlinkNotifyCfg[accId] = 1;
					
					if(extensionConfig.messagingNotifications[sName].notificationSound == "mute")
						extensionConfig.messagingNotifyAlertCfg[accId] = 0;
					else if(extensionConfig.messagingNotifications[sName].notificationSound == "alert")
						extensionConfig.messagingNotifyAlertCfg[accId] = 1;			
					else if(extensionConfig.messagingNotifications[sName].notificationSound == "ringtone") {
						if((extensionConfig.messagingNotifications[sName].ringtone) &&
							(extensionConfig.messagingNotifications[sName].ringtone.path) &&
							(extensionConfig.messagingNotifications[sName].ringtone.path.length > 0))
						{
							extensionConfig.messagingRingtoneNameCfg[accId] = extensionConfig.messagingNotifications[sName].ringtone.name;
							extensionConfig.messagingRingtonePathCfg[accId] = extensionConfig.messagingNotifications[sName].ringtone.path; 
						}
					}
					else if(extensionConfig.messagingNotifications[sName].notificationSound == "vibrate")
						extensionConfig.messagingNotifyAlertCfg[accId] = 3;
				}
				
				extensionConfig.messagingAvailabilityCfg[accId] = serviceResponse.results[i].availability;
				
				extensionConfig.messagingAccountsCfg.push({
					'databaseId': serviceResponse.results[i]._id,
					'accountId': serviceResponse.results[i].accountId,
					'serviceName': sName,
					'identifier': extensionConfig.messagingAccounts[accId] + " - " + serviceResponse.results[i].username });
				
				this.accountSelectorChoices.push({
					'label': extensionConfig.messagingAccounts[accId] + " - " + serviceResponse.results[i].username, 
					'value': serviceResponse.results[i].accountId });
			}
		}
	}

	this.getSystemSettings(++requestID, extensionConfig, doneCallback);
}

//

MessagingSettings.prototype.gotSystemSettings = function(extensionPreferences, doneCallback, extensionConfig) {
	for(var i = 0; i < extensionConfig.messagingAccountsCfg.length; i++) {
		var accId = extensionConfig.messagingAccountsCfg[i].accountId;
		
		extensionPreferences.accounts[accId] = {
			serviceName: extensionConfig.messagingAccountsCfg[i].serviceName,
			databaseId: extensionConfig.messagingAccountsCfg[i].databaseId,
			identifier: extensionConfig.messagingAccountsCfg[i].identifier };
		
		if(accId == "sms") {
			if(extensionPreferences.blinkNotify["sms"] != undefined)
				extensionPreferences.blinkNotify[accId] = extensionPreferences.blinkNotify["sms"];

			if(extensionPreferences.notifyAlert["sms"] != undefined)
				extensionPreferences.notifyAlert[accId] = extensionPreferences.notifyAlert["sms"];

			if(extensionPreferences.ringtoneName["sms"] != undefined)
				extensionPreferences.ringtoneName[accId] = extensionPreferences.ringtoneName["sms"];

			if(extensionPreferences.ringtonePath["sms"] != undefined)
				extensionPreferences.ringtonePath[accId] = extensionPreferences.ringtonePath["sms"];
		}
		else {
			if(extensionPreferences.blinkNotify["im"] != undefined)
				extensionPreferences.blinkNotify[accId] = extensionPreferences.blinkNotify["im"];

			if(extensionPreferences.notifyAlert["im"] != undefined)
				extensionPreferences.notifyAlert[accId] = extensionPreferences.notifyAlert["im"];

			if(extensionPreferences.ringtoneName["im"] != undefined)
				extensionPreferences.ringtoneName[accId] = extensionPreferences.ringtoneName["im"];

			if(extensionPreferences.ringtonePath["im"] != undefined)
				extensionPreferences.ringtonePath[accId] = extensionPreferences.ringtonePath["im"];

			if(extensionPreferences.availability["im"] != undefined)
				extensionPreferences.availability[accId] = extensionPreferences.availability["im"];
		}
	}

	if(extensionPreferences.blinkNotify["im"] != undefined)
		delete extensionPreferences.blinkNotify["im"];

	if(extensionPreferences.notifyAlert["im"] != undefined)
		delete extensionPreferences.notifyAlert["im"];

	if(extensionPreferences.ringtoneName["im"] != undefined)
		delete extensionPreferences.ringtoneName["im"];

	if(extensionPreferences.ringtonePath["im"] != undefined)
		delete extensionPreferences.ringtonePath["im"];

	if(extensionPreferences.availability["im"] != undefined)
		delete extensionPreferences.availability["im"];

	doneCallback();
}

