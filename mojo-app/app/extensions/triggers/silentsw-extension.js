function SilentswTriggers(controller) {
	this.controller = controller;
}

//

SilentswTriggers.prototype.basic = function() {
	return true;
}

//

SilentswTriggers.prototype.label = function() {
	return $L("Silent Switch Trigger");
}

//

SilentswTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesSwitchStateSelector = [
		{'label': $L("Switch On"), 'value': 1},
		{'label': $L("Switch Off"), 'value': 0} ];  

	this.controller.setupWidget("SilentswStateSelector", {'label': $L("State"), 
		'labelPlacement': "left", 'modelProperty': "silentswState",
		'choices': this.choicesSwitchStateSelector});

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

SilentswTriggers.prototype.config = function() {
	var extensionConfig = {
		'silentswTitle': $L("Silent Switch"),
		'silentswState': 1 };
	
	return extensionConfig;
}

//

SilentswTriggers.prototype.load = function(extensionPreferences) {
	var state = 1;
	
	if(extensionPreferences.state == "up")
		state = 0;

	var extensionConfig = {
		'silentswTitle': $L("Silent Switch"),
		'silentswState': state };
	
	return extensionConfig;
}

SilentswTriggers.prototype.save = function(extensionConfig) {
	var state = "down";
	
	if(extensionConfig.silentswState == 0)
		state = "up";
	
	var extensionPreferences = {
		'state': state };
	
	return extensionPreferences;
}

//

SilentswTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "SilentswStateHelp") {
		var helpTitle = "State";

		var helpText = "State of the silent switch when the mode should be active.";
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

