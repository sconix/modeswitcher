function BrowserActions(controller) {
	this.controller = controller;
}

//

BrowserActions.prototype.appid = function(type) {
	if(type == "app")
		return "com.palm.app.browser";
}

//

BrowserActions.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesBrowserLaunchSelector = [
		{'label': $L("On Mode Start"), value: "start"},
		{'label': $L("On Mode Close"), value: "close"}];  

	this.controller.setupWidget("BrowserLaunchSelector", {'label': $L("Launch"), 
		'labelPlacement': "left", 'modelProperty': "launchMode",
		'choices': this.choicesBrowserLaunchSelector});

	// URL text field
			
	this.controller.setupWidget("BrowserURLText", { 'hintText': $L("Enter URL to load..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 
		'textCase': Mojo.Widget.steModeLowerCase, 'modelProperty': "launchURL"});

	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

BrowserActions.prototype.config = function(launchPoint) {
	var url = "";

	if((launchPoint.params) && (launchPoint.params.url))
		url = launchPoint.params.url;

	var extensionConfig = {
		'name': launchPoint.title,
		'launchMode': "start", 
		'launchURL': url };
	
	return extensionConfig;
}

//

BrowserActions.prototype.load = function(extensionPreferences) {
	var launchURL = "";
	
	try {eval("var params = " + extensionPreferences.params);} catch(error) {var params = "";}

	if(params.target != undefined)
		launchURL = params.target;

	var extensionConfig = {
		'name': extensionPreferences.name,
		'launchMode': extensionPreferences.event, 
		'launchURL': launchURL };
	
	return extensionConfig;
}

BrowserActions.prototype.save = function(extensionConfig) {
	var params = "";

	if(extensionConfig.launchURL.length != 0)
		params = "{target: '" + extensionConfig.launchURL + "'}";

	var extensionPreferences = {
		'type': "app",
		'name': extensionConfig.name,
		'event': extensionConfig.launchMode,
		'appid': this.appid("app"), 
		'params': params };
	
	return extensionPreferences;
}

//

BrowserActions.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "BrowserLaunchHelp") {
		var helpTitle = "Launch";

		var helpText = "Determines when the application is launched.";
	}
	else if(event.originalEvent.target.id == "BrowserURLHelp") {
		var helpTitle = "URL";

		var helpText = "Address to load when browser is started.";
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

