function HeadsetTriggers(controller) {
	this.controller = controller;
}

//

HeadsetTriggers.prototype.basic = function() {
	return true;
}

//

HeadsetTriggers.prototype.label = function() {
	return $L("Headset State Trigger");
}

//

HeadsetTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesStateSelector = [
		{'label': $L("Connected"), 'value': 0}, 
		{'label': $L("Not Connected"), 'value': 1} ];  

	this.controller.setupWidget("HeadsetStateSelector", {'label': $L("State"), 
		'labelPlacement': "left", 'modelProperty': "headsetState",
		'choices': this.choicesStateSelector});

	this.choicesScenarioSelector = [
		{'label': $L("Any Scenario"), 'value': 0}, 
		{'label': $L("Headset"), 'value': 1},
		{'label': $L("Headset / Mic"), 'value': 2} ];  

	this.controller.setupWidget("HeadsetScenarioSelector", {'label': $L("Scenario"), 
		'labelPlacement': "left", 'modelProperty': "headsetScenario",
		'choices': this.choicesScenarioSelector});

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

HeadsetTriggers.prototype.config = function() {
	var extensionConfig = {
		'headsetTitle': $L("Headset State"),
		'headsetState': 0,
		'headsetScenario': 0 };
	
	return extensionConfig;
}

//

HeadsetTriggers.prototype.load = function(extensionPreferences) {
	var extensionConfig = {
		'headsetTitle': $L("Headset State"),
		'headsetState': extensionPreferences.state,
		'headsetScenario': extensionPreferences.scenario };
	
	return extensionConfig;
}

HeadsetTriggers.prototype.save = function(extensionConfig) {
	var extensionPreferences = {
		'state': extensionConfig.headsetState,
		'scenario': extensionConfig.headsetScenario };
	
	return extensionPreferences;
}

//

HeadsetTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "HeadsetStateHelp") {
		var helpTitle = "State";

		var helpText = "Headset state when the mode should be active. Can be limited with type of the headset that determines the scenario WebOS uses for audio.";
	}
	else if(event.originalEvent.target.id == "HeadsetScenarioHelp") {
		var helpTitle = "Scenario";

		var helpText = "The required audio scenario for the mode to be active. The type of the headset will determine the scenario WebOS uses.";
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

