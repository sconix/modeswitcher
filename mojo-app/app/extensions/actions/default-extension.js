function DefaultActions(controller) {
	this.controller = controller;
}

//

DefaultActions.prototype.appid = function(type) {
	if(type == "app")
		return "any";
}

//

DefaultActions.prototype.setup = function(controller) {
	this.controller = controller;
	
	this.choicesDefaultLaunchSelector = [
		{'label': $L("On Mode Start"), value: "start"},
		{'label': $L("On Mode Close"), value: "close"} ];  

	this.controller.setupWidget("DefaultLaunchSelector", {'label': $L("Launch"), 
		'labelPlacement': "left", 'modelProperty': "launchMode",
		'choices': this.choicesDefaultLaunchSelector} );

	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

DefaultActions.prototype.config = function(launchPoint) {
	var extensionConfig = {
		'name': launchPoint.title, 
		'appid': launchPoint.id,
		'launchMode': "start" };
	
	return extensionConfig;
}

//

DefaultActions.prototype.load = function(extensionPreferences) {
	var extensionConfig = {
		'name': extensionPreferences.name,
		'appid': extensionPreferences.appid,
		'launchMode': extensionPreferences.event };
	
	return extensionConfig;
}

DefaultActions.prototype.save = function(extensionConfig) {
	var extensionPreferences = {
		'type': "app",
		'name': extensionConfig.name,
		'event': extensionConfig.launchMode,
		'appid': extensionConfig.appid, 
		'params': "" };
	
	return extensionPreferences;
}

//

DefaultActions.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "DefaultLaunchHelp") {
		var helpTitle = "Launch";

		var helpText = "Determines when the application is launched.";
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

