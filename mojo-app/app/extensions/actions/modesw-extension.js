function ModeswActions(controller) {
	this.controller = controller;
}

//

ModeswActions.prototype.appid = function(type) {
	if(type == "ms")
		return "org.e.lnx.wee.modeswitcher";
}

//

ModeswActions.prototype.setup = function(controller, modeName, modeType) {
	this.controller = controller;

	this.modeName = modeName;
	this.modeType = modeType;

	this.modesList = [];

	this.choicesModeswStartSelector = [{'label': $L("Previous Mode"), 'value': "Previous Mode"}];
	this.choicesModeswCloseSelector = [{'label': $L("Previous Mode"), 'value': "Previous Mode"}];
	this.choicesModeswTriggerSelector = [{'label': $L("Previous Mode"), 'value': "Previous Mode"}];

	this.choicesModeswProcessSelector = [
		{'label': $L("Before Mode Start"), value: "start"},
		{'label': $L("Before Mode Close"), value: "close"},
		{'label': $L("Before Mode Switch"), value: "switch"},
		{'label': $L("After Mode Start"), value: "started"},
		{'label': $L("After Mode Close"), value: "closed"},
		{'label': $L("After Mode Switch"), value: "switched"} ];  

	this.controller.setupWidget("ModeswProcessSelector", {'label': $L("Execute"), 
		'labelPlacement': "left", 'modelProperty': "modeProcess",
		'choices': this.choicesModeswProcessSelector});
	
	this.choicesModeswActionSelector = [
		{'label': $L("Start Mode"), value: "start"},
		{'label': $L("Close Mode"), value: "close"},
		{'label': $L("Trigger Mode"), value: "trigger"},
		{'label': $L("Enable Triggers"), value: "unlock"},
		{'label': $L("Disable Triggers"), value: "lock"} ];  

	this.controller.setupWidget("ModeswActionSelector", {'label': $L("Action"), 
		'labelPlacement': "left", 'modelProperty': "modeAction",
		'choices': this.choicesModeswActionSelector});

	this.controller.setupWidget("ModeswStartSelector", {'label': $L("Mode"), 
		'labelPlacement': "left", 'modelProperty': "modeName",
		'choices': this.choicesModeswStartSelector});

	this.controller.setupWidget("ModeswCloseSelector", {'label': $L("Mode"), 
		'labelPlacement': "left", 'modelProperty': "modeName",
		'choices': this.choicesModeswCloseSelector});

	this.controller.setupWidget("ModeswTriggerSelector", {'label': $L("Mode"), 
		'labelPlacement': "left", 'modelProperty': "modeName",
		'choices': this.choicesModeswTriggerSelector});

	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	// Listen for change event for action selector
	
	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
		
	this.retrieveModesList();
}

//

ModeswActions.prototype.config = function(launchPoint) {
	if(this.modeType == "default") {
		var extensionConfig = {
			'name': launchPoint.title,
			'modeProcess': "start", 
			'modeAction': "close", 
			'modeName': "All Modifier Modes",
			'modeActionRow': "",
			'modeStartDisplay': "none",
			'modeCloseDisplay': "block",
			'modeTriggerDisplay': "none" };
	}
	else if(this.modeType == "normal") {
		var extensionConfig = {
			'name': launchPoint.title,
			'modeProcess': "close", 
			'modeAction': "start", 
			'modeName': "Previous Mode",
			'modeActionRow': "",
			'modeStartDisplay': "block",
			'modeCloseDisplay': "none",
			'modeTriggerDisplay': "none" };
	}
	else if(this.modeType == "modifier") {
		var extensionConfig = {
			'name': launchPoint.title,
			'modeProcess': "start", 
			'modeAction': "trigger", 
			'modeName': "All Modifier Modes",
			'modeActionRow': "",
			'modeStartDisplay': "none",
			'modeCloseDisplay': "none",
			'modeTriggerDisplay': "block" };
	}

	return extensionConfig;
}

//

ModeswActions.prototype.load = function(extensionPreferences) {
	var row = "";
	var startDisplay = "none";
	var closeDisplay = "none";
	var triggerDisplay = "none";

	if((extensionPreferences.action == "unlock") || (extensionPreferences.action == "lock"))
		row = "last";
	else if(extensionPreferences.action == "start")
		startDisplay = "block";
	else if(extensionPreferences.action == "close")
		closeDisplay = "block";
	else if(extensionPreferences.action == "trigger")
		triggerDisplay = "block";
	
	var extensionConfig = {
		'name': extensionPreferences.name,	
		'modeProcess': extensionPreferences.event, 
		'modeAction': extensionPreferences.action, 
		'modeName': extensionPreferences.mode,
		'modeActionRow': row,
		'modeStartDisplay': startDisplay,
		'modeCloseDisplay': closeDisplay,
		'modeTriggerDisplay': triggerDisplay };
	
	return extensionConfig;
}

ModeswActions.prototype.save = function(extensionConfig) {
	var extensionPreferences = {
		'type': "ms",
		'name': extensionConfig.name,
		'event': extensionConfig.modeProcess,
		'action': extensionConfig.modeAction,
		'mode': extensionConfig.modeName };
	
	return extensionPreferences;
}

//

ModeswActions.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "ModeswProcessHelp") {
		var helpTitle = "Execute";

		var helpText = "Determines when the action is executed, before or after processing modes settings and apps.<br><br><b>Before/After Mode Start:</b> before/after processing when this mode is started.<br><b>Before/After Mode Close:</b> before/after processing when this mode is closed.<br><b>Before Mode Switch:</b> before processing when switched to this mode.<br><b>After Mode Switch:</b> after processing when switched to this mode.";
	}
	else if(event.originalEvent.target.id == "ModeswActionHelp") {
		var helpTitle = "Action";

		var helpText = "Action to be executed when processed. Can be used to start/close/trigger modes and to enable/disable triggers. Trigger mode means that mode is started if its triggers are valid and closed if its triggers are not valid.";
	}
	else if(event.originalEvent.target.id == "ModeswModeHelp") {
		var helpTitle = "Mode";

		var helpText = "Mode or modes to start/close/trigger. If you change the target modes name then you need to remove and re-add this configuration.";
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

ModeswActions.prototype.retrieveModesList = function() {
	this.controller.serviceRequest('palm://org.e.lnx.wee.modeswitcher.srv', {
		'method': 'prefs', 'parameters': {'keys': ["customModes"]},
		'onSuccess': this.handleModeData.bind(this)} );
}

ModeswActions.prototype.handleModeData = function(serviceResponse) {
	this.modesList.clear();
	
	this.modesList.push({'label': $L("All Normal Modes"), 'value': "All Normal Modes", 'type': "alln"});  	
	this.modesList.push({'label': $L("All Modifier Modes"), 'value': "All Modifier Modes", 'type': "allm"});  	
	this.modesList.push({'label': $L("Current Mode"), 'value': "Current Mode", 'type': "current"});  
	this.modesList.push({'label': $L("Previous Mode"), 'value': "Previous Mode", 'type': "previous"});  

	for(var i = 0; i < serviceResponse.customModes.length; i++) {
		this.modesList.push({
			'label': serviceResponse.customModes[i].name, 
			'value': serviceResponse.customModes[i].name, 
			'type': serviceResponse.customModes[i].type});  
	}

	this.choicesModeswStartSelector.clear();
	this.choicesModeswCloseSelector.clear();
	this.choicesModeswTriggerSelector.clear();

	for(var i = 0; i < this.modesList.length; i++) {
		if((this.modesList[i].type != "current") && (this.modesList[i].type != "default") &&
			(this.modesList[i].type != "alln")) 
		{
			if(((this.modesList[i].type != "previous") || (this.modeType == "default") || 
				(this.modeType == "normal")) && (this.modeName != this.modesList[i].value))
			{
				this.choicesModeswStartSelector.push(this.modesList[i]);
			}
		}

		if((this.modesList[i].type == "current") || (this.modesList[i].type == "normal") ||
			(this.modesList[i].type == "modifier") || (this.modesList[i].type == "allm"))
		{
			if(((this.modeType == "modifier") || (this.modesList[i].type != "current")) &&
				(((this.modeType == "default") && (this.modesList[i].type != "normal")) ||
				((this.modeType != "default") && ((this.modesList[i].type != "normal") || 
				(this.modeName == this.modesList[i].value)))))
			{
				this.choicesModeswCloseSelector.push(this.modesList[i]);
			}
		}

		if((this.modesList[i].type != "current") && (this.modesList[i].type != "default")) {
			if(((this.modeType != "modifier") || (this.modesList[i].type != "previous")) && 
				(this.modeName != this.modesList[i].value))
			{
				this.choicesModeswTriggerSelector.push(this.modesList[i]);
			}
		}
	}		
}

//

ModeswActions.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "modeAction") {
		if((changeEvent.value == "unlock") || (changeEvent.value == "lock")) {
			changeEvent.model.modeActionRow = "last";
			changeEvent.model.modeStartDisplay = "none";
			changeEvent.model.modeCloseDisplay = "none";
			changeEvent.model.modeTriggerDisplay = "none";
		}
		else {
			changeEvent.model.modeActionRow = "";
			changeEvent.model.modeStartDisplay = "none";
			changeEvent.model.modeCloseDisplay = "none";
			changeEvent.model.modeTriggerDisplay = "none";

			if(changeEvent.value == "start") {
				changeEvent.model.modeStartDisplay = "block";
				
				if(this.modeType == "modifier")
					changeEvent.model.modeName = "All Modifier Modes";
				else
					changeEvent.model.modeName = "Previous Mode";				
			}
			else if(changeEvent.value == "close") {
				changeEvent.model.modeCloseDisplay = "block";

				if(this.modeType == "default")
					changeEvent.model.modeName = "All Modifier Modes";
				else
					changeEvent.model.modeName = "Current Mode";					
			}
			else if(changeEvent.value == "trigger") {
				changeEvent.model.modeTriggerDisplay = "block";
				
				if(this.modeType == "modifier")
					changeEvent.model.modeName = "All Modifier Modes";
				else
					changeEvent.model.modeName = "Previous Mode";
			}
		}
		
		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("AppsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
}

