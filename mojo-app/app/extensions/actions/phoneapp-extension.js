function PhoneappActions(controller) {
	this.controller = controller;
}

//

PhoneappActions.prototype.appid = function(type) {
	if(type == "app")
		return "com.palm.app.phone";
}

//

PhoneappActions.prototype.setup = function(controller) {
	this.controller = controller;
	
	this.choicesPhoneappLaunchSelector = [
		{'label': $L("On Mode Start"), value: "start"},
		{'label': $L("On Mode Close"), value: "close"} ];  

	this.controller.setupWidget("PhoneappLaunchSelector", {'label': $L("Launch"), 
		'labelPlacement': "left", 'modelProperty': "launchMode",
		'choices': this.choicesPhoneappLaunchSelector} );
			
	this.controller.setupWidget("PhoneappNumberText", { 'hintText': $L("Enter phone number..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 
		'textCase': Mojo.Widget.steModeLowerCase, 'modelProperty': "launchNumber"} );

	this.controller.listen(this.controller.get("AppsList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

PhoneappActions.prototype.config = function(launchPoint) {
	var extensionConfig = {
		'name': launchPoint.title,
		'launchMode': "start",
		'launchNumber': "" };
	
	return extensionConfig;
}

//

PhoneappActions.prototype.load = function(extensionPreferences) {
	var launchNumber = "";
	
	try {eval("var params = " + extensionPreferences.params);} catch(error) {var params = "";}

	if(params.number != undefined)
		launchNumber = params.number;
		
	var extensionConfig = {
		'name': extensionPreferences.name,		
		'launchMode': extensionPreferences.event,
		'launchNumber': launchNumber };
	
	return extensionConfig;
}

PhoneappActions.prototype.save = function(extensionConfig) {
	var params = "";

	if(extensionConfig.launchNumber.length != 0)
		params = "{number: '" + extensionConfig.launchNumber + "'}";

	var extensionPreferences = {
		'type': "app",
		'name': extensionConfig.name,		
		'event': extensionConfig.launchMode,
		'appid': this.appid("app"), 
		'params': params };
	
	return extensionPreferences;
}

//

PhoneappActions.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "PhoneappLaunchHelp") {
		var helpTitle = "Launch";

		var helpText = "Determines when the application is started.";
	}
	else if(event.originalEvent.target.id == "PhoneappNumberHelp") {
		var helpTitle = "Number";

		var helpText = "Number string to prefill for the dialing. Can be used to set call redirection etc.";
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

