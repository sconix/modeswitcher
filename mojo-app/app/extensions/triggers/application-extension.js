function ApplicationTriggers(controller) {
	this.controller = controller;
}

//

ApplicationTriggers.prototype.basic = function() {
	return true;
}

//

ApplicationTriggers.prototype.label = function() {
	return $L("Application Trigger");
}

//

ApplicationTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesApplicationSelector = [];  

	this.choicesStateSelector = [
		{'label': $L("On Foreground"), 'value': 0},
		{'label': $L("On Background"), 'value': 1} ];  

	this.controller.setupWidget("ApplicationStateSelector", {'label': $L("State"), 
		'labelPlacement': "left", 'modelProperty': "applicationState",
		'choices': this.choicesStateSelector});
	
	this.controller.setupWidget("ApplicationIdSelector", {'label': $L("Application"), 
		'labelPlacement': "left", 'modelProperty': "applicationId",
		'choices': this.choicesApplicationSelector});

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	this.listApplications();
}

//

ApplicationTriggers.prototype.config = function() {
	var id = "";
	
	if(this.choicesApplicationSelector[0] != undefined)
		var id = this.choicesApplicationSelector[0].value;

	var triggerConfig = {
		'applicationTitle': $L("Application"),
		'applicationState': 0,
		'applicationId': id };
	
	return triggerConfig;
}

//

ApplicationTriggers.prototype.load = function(triggerPreferences) {
	var triggerConfig = {
		'applicationTitle': $L("Application"),
		'applicationState': triggerPreferences.appState,
		'applicationId': triggerPreferences.appId };
	
	return triggerConfig;
}

ApplicationTriggers.prototype.save = function(triggerConfig) {
	var triggerPreferences = {
		'appState': triggerConfig.applicationState,
		'appId': triggerConfig.applicationId };
	
	return triggerPreferences;
}

//

ApplicationTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "ApplicationStateHelp") {
		var helpTitle = "State";

		var helpText = "When the mode should be started / closed.<br><br><b>On Foregound:</b> mode active when application is running on foreground.<br><b>On Background:</b> mode active when application is in background or closed.";
	}
	else if(event.originalEvent.target.id == "ApplicationIdHelp") {
		var helpTitle = "Application";

		var helpText = "The application that triggers starting / closing of the mode.";
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

ApplicationTriggers.prototype.listApplications = function() {
	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.sys/", {'method': "systemCall",
		'parameters': {
		'id': "com.palm.launcher", 'service': "com.palm.applicationManager", 
		'method': "listLaunchPoints", 'params': {}}, 
		'onComplete': function(response) {
			var appItems = [];

			this.launchPoints = response.launchPoints;
				
			this.launchPoints.sort(this.sortAlphabeticallyFunction);
			
			this.launchPoints.each(function(item, index){
				this.choicesApplicationSelector.push({'label': item.title, 'value': item.appId});
			}.bind(this));
			
			var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

			this.controller.get("TriggersList").mojo.invalidateItems(0);
		
			this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);		
		}.bind(this)});
}

ApplicationTriggers.prototype.sortAlphabeticallyFunction = function(compareA, compareB){
	if(compareA.type != undefined) {
		var a = compareA.type.toLowerCase();
		var b = compareB.type.toLowerCase();
	}
	else {
		var a = compareA.title.toLowerCase();
		var b = compareB.title.toLowerCase();
	}
	
	return ((a < b) ? -1 : ((a > b) ? 1 : 0));
}

