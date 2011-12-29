function SystoolsActions(controller) {
	this.controller = controller;
}

//

SystoolsActions.prototype.appid = function(type) {
	return "ca.canucksoftware.systoolsmgr";
}

//

SystoolsActions.prototype.setup = function(controller) {
	this.controller = controller;
	
	this.choicesSystoolsLaunchSelector = [
		{'label': $L("On Mode Start"), value: "start"},
		{'label': $L("On Mode Close"), value: "close"} ];  

	this.controller.setupWidget("SystoolsLaunchSelector", {'label': $L("Launch"), 
		'labelPlacement': "left", 'modelProperty': "systoolsLaunchMode",
		'choices': this.choicesSystoolsLaunchSelector} );

	this.choicesSystoolsStartSelector = [
		{'label': $L("Do Nothing"), 'value': 0},
		{'label': $L("Restart Luna"), 'value': 1},
		{'label': $L("Restart Device"), 'value': 2}];

	this.controller.setupWidget("SystoolsStartSelector", {'label': $L("On Start"), 
		'labelPlacement': "left", 'modelProperty': "systoolsStartAction",
		'choices': this.choicesSystoolsStartSelector});

	this.choicesSystoolsCloseSelector = [
		{'label': $L("Do Nothing"), 'value': 0},
		{'label': $L("Restart Luna"), 'value': 1},
		{'label': $L("Restart Device"), 'value': 2}];

	this.controller.setupWidget("SystoolsCloseSelector", {'label': $L("On Close"), 
		'labelPlacement': "left", 'modelProperty': "systoolsCloseAction",
		'choices': this.choicesSystoolsCloseSelector});

	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

SystoolsActions.prototype.config = function(launchPoint) {
	if(launchPoint.type == "app") {
		var appDisplay = "block";
		var srvDisplay = "none";
	}
	else {
		var appDisplay = "none";
		var srvDisplay = "block";
	}

	var extensionConfig = {
		'systoolsName': launchPoint.title,
		'systoolsAppType': launchPoint.type,
		'systoolsLaunchMode': "start",
		'systoolsStartAction': 0,
		'systoolsCloseAction': 0,		
		'systoolsAppCfgDisplay': appDisplay,
		'systoolsSrvCfgDisplay': srvDisplay };
	
	return extensionConfig;
}

//

SystoolsActions.prototype.load = function(extensionPreferences) {
	var startAction = 0;
	var closeAction = 0;
	
	if(extensionPreferences.type == "app") {
		var launchMode = extensionPreferences.event;
		
		var displayAppCfg = "block";
		var displaySrvCfg = "none";
	}
	else {	
		var launchMode = "none";

		var displayAppCfg = "none";
		var displaySrvCfg = "block";
		
		if(extensionPreferences.event != "none") {
			if(extensionPreferences.method.start == "lunaRestart")
				startAction = 1;
			else if(extensionPreferences.method.start == "deviceRestart")
				startAction = 2;

			if(extensionPreferences.method.close == "lunaRestart")
				closeAction = 1;
			else if(extensionPreferences.method.close == "deviceRestart")
				closeAction = 2;
		}
	}
	
	var extensionConfig = {
		'systoolsName': extensionPreferences.name,
		'systoolsAppType': extensionPreferences.type,
		'systoolsLaunchMode': launchMode,
		'systoolsStartAction': startAction,
		'systoolsCloseAction': closeAction,
		'systoolsAppCfgDisplay': displayAppCfg,
		'systoolsSrvCfgDisplay': displaySrvCfg };
	
	return extensionConfig;
}

SystoolsActions.prototype.save = function(extensionConfig) {
	if(extensionConfig.systoolsAppType == "app") {
		var extensionPreferences = {
			'type': "app",
			'name': extensionConfig.systoolsName,
			'event': extensionConfig.systoolsLaunchMode,
			'appid': this.appid(),
			'params': "" };
	}
	else {
		var event = "none";
		var method = {};
		var params = {};

		if((extensionConfig.systoolsStartAction != 0) &&
			(extensionConfig.systoolsCloseAction != 0))
		{
			var event = "both";
		}
		else if(extensionConfig.systoolsStartAction != 0)
			var event = "start";
		else if(extensionConfig.systoolsCloseAction != 0)
			var event = "close";

		if(extensionConfig.systoolsStartAction != 0) {
			if(extensionConfig.systoolsStartAction == 1)
				method.start = "lunaRestart";
			else if(extensionConfig.systoolsStartAction == 2)
				method.start = "deviceRestart";
			
			params.start = {};
		}
		
		if(extensionConfig.systoolsCloseAction != 0) {
			if(extensionConfig.systoolsCloseAction == 1)
				method.close = "lunaRestart";
			else if(extensionConfig.systoolsCloseAction == 2)
				method.close = "deviceRestart";

			params.close = {};
		}		

		var extensionPreferences = {
			'type': "srv",
			'name': extensionConfig.systoolsName,
			'event': event,
			'url': "palm://" + this.appid(),
			'method': method,
			'params': params };
	}
		
	return extensionPreferences;
}

//

SystoolsActions.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "SystoolsLaunchHelp") {
		var helpTitle = "Launch";

		var helpText = "Determines when the application is launched.";
	}
	else if(event.originalEvent.target.id == "SystoolsStartHelp") {
		var helpTitle = "On Start";

		var helpText = "Determines what action is requested when mode starts.";
	}
	else if(event.originalEvent.target.id == "SystoolsCloseHelp") {
		var helpTitle = "On Close";

		var helpText = "Determines what action is requested when mode closes.";
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

