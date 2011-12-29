function GovnahActions(controller) {
	this.controller = controller;
}

//

GovnahActions.prototype.appid = function(type) {
	return "org.webosinternals.govnah";
}

//

GovnahActions.prototype.data = function(profiles) {
	if(profiles.length > 0) {
		this.choicesGovnahStartSelector.clear();
		this.choicesGovnahCloseSelector.clear();
	}

	this.normal = true;

	for(var i = 0; i < profiles.length; i++) {
		if(profiles[i].id == 0) {
			this.normal = false;
			break;
		}
	}
		
	if((this.normal) && (profiles.length > 0)) {
		this.choicesGovnahStartSelector.push({'label': $L("Do Nothing"), 'value': 0});  
		this.choicesGovnahCloseSelector.push({'label': $L("Do Nothing"), 'value': 0});  
	}

	for(var i = 0; i < profiles.length; i++) {
		this.choicesGovnahStartSelector.push({'label': profiles[i].name, 'value': profiles[i].id});  

		this.choicesGovnahCloseSelector.push({'label': profiles[i].name, 'value': profiles[i].id});  
	}
	
	var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

	this.controller.get("AppsList").mojo.invalidateItems(0);
	
	this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);		
}

//

GovnahActions.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesGovnahLaunchSelector = [
		{'label': $L("On Mode Start"), value: "start"},
		{'label': $L("On Mode Close"), value: "close"} ];  

	this.controller.setupWidget("GovnahLaunchSelector", {'label': $L("Launch"), 
		'labelPlacement': "left", 'modelProperty': "launchMode",
		'choices': this.choicesGovnahLaunchSelector} );

	this.choicesGovnahStartSelector = [{'label': $L("No Profiles"), 'value': 0}];

	this.controller.setupWidget("GovnahStartSelector", {'label': $L("On Start"), 
		'labelPlacement': "left", 'modelProperty': "startProfile",
		'choices': this.choicesGovnahStartSelector});

	this.choicesGovnahCloseSelector = [{'label': $L("No Profiles"), 'value': 0}];

	this.controller.setupWidget("GovnahCloseSelector", {'label': $L("On Close"), 
		'labelPlacement': "left", 'modelProperty': "closeProfile",
		'choices': this.choicesGovnahCloseSelector});

	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	// Listen for change event for action selector
	
	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));

	this.controller.serviceRequest("palm://org.webosinternals.govnah/", {
		'method': "getProfiles", 'parameters': {'returnid': Mojo.Controller.appInfo.id}});
}

//

GovnahActions.prototype.config = function(launchPoint) {
	if(launchPoint.type == "app") {
		var appDisplay = "block";
		var srvDisplay = "none";
	}
	else {
		var appDisplay = "none";
		var srvDisplay = "block";
	}

	var appConfig = {
		'name': launchPoint.title,
		'appType': launchPoint.type,
		'launchMode': "start",
		'startProfile': 0, 
		'closeProfile': 0,
		'govnahAppCfgDisplay': appDisplay,
		'govnahSrvCfgDisplay': srvDisplay };
	
	return appConfig;
}

//

GovnahActions.prototype.load = function(appPreferences) {
	var startProfile = 0;
	var closeProfile = 0;

	if(appPreferences.type == "app") {
		var launchMode = appPreferences.event;
		
		var displayAppCfg = "block";
		var displaySrvCfg = "none";
	}
	else {	
		var launchMode = "start";

		var displayAppCfg = "none";
		var displaySrvCfg = "block";
		
		try {eval("var startParams = " + appPreferences.params.start);} catch(error) {var startParams = "";}

		try {eval("var closeParams = " + appPreferences.params.close);} catch(error) {var closeParams = "";}

		if(startParams.profileid != undefined)
			startProfile = startParams.profileid;

		if(closeParams.profileid != undefined)
			closeProfile = closeParams.profileid;
	}
	
	var appConfig = {
		'name': appPreferences.name,
		'appType': appPreferences.type,
		'launchMode': launchMode,
		'startProfile': startProfile,
		'closeProfile': closeProfile,
		'govnahAppCfgDisplay': displayAppCfg,
		'govnahSrvCfgDisplay': displaySrvCfg };
	
	return appConfig;
}

GovnahActions.prototype.save = function(appConfig) {
	if(appConfig.appType == "app") {
		var appPreferences = {
			'type': "app",
			'name': appConfig.name,
			'event': appConfig.launchMode,
			'appid': this.appid(),
			'params': "" };
	}
	else {
		var event = "both";
	
		if(this.normal) {
			if((appConfig.startProfile == 0) && (appConfig.closeProfile == 0))
				event = "none";
			else if(appConfig.startProfile == 0)
				event = "close";
			else if(appConfig.closeProfile == 0)
				event = "start";
		}

		var params = {};
	
		params.start = "{profileid: " + appConfig.startProfile + "}";
		params.close = "{profileid: " + appConfig.closeProfile + "}";

		var appPreferences = {
			'type': "srv",
			'name': appConfig.name,
			'event': event,
			'url': "palm://org.webosinternals.govnah/",
			'method': "setProfile",
			'params': params };
	}
		
	return appPreferences;
}

//

GovnahActions.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "GovnahLaunchHelp") {
		var helpTitle = "Launch";

		var helpText = "Determines when the application is launched.";
	}
	else if(event.originalEvent.target.id == "GovnahStartHelp") {
		var helpTitle = "On Start";

		var helpText = "Determines which profile is requested to be set when the mode starts.";
	}
	else if(event.originalEvent.target.id == "GovnahCloseHelp") {
		var helpTitle = "On Close";

		var helpText = "Determines which profile is requested to be set when the mode closes.";
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

GovnahActions.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "appType") {
		if(changeEvent.value == "app") {
			changeEvent.model.launchMode = "start";
		
			changeEvent.model.govnahAppCfgDisplay = "block";
			changeEvent.model.govnahSrvCfgDisplay = "none";
		}
		else if(changeEvent.value == "srv") {
			changeEvent.model.govnahAppCfgDisplay = "none";
			changeEvent.model.govnahSrvCfgDisplay = "block";
		}		

		var state = this.controller.get('mojo-scene-editmode-scene-scroller').mojo.getState();

		this.controller.get("AppsList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-editmode-scene-scroller').mojo.setState(state);
	}
}

