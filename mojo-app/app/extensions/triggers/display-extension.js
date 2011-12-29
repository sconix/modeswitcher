function DisplayTriggers(controller) {
	this.controller = controller;
}

//

DisplayTriggers.prototype.basic = function() {
	return true;
}

//

DisplayTriggers.prototype.label = function() {
	return $L("Display State Trigger");
}

//

DisplayTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesStateSelector = [
		{'label': $L("Locked"), 'value': 1},
		{'label': $L("Unlocked"), 'value': 0} ];  

	this.controller.setupWidget("DisplayStateSelector", {'label': $L("State"), 
		'labelPlacement': "left", 'modelProperty': "displayLocked",
		'choices': this.choicesStateSelector});

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

DisplayTriggers.prototype.config = function() {
	var extensionConfig = {
		'displayTitle': $L("Display State"),
		'displayLocked': 1 };
	
	return extensionConfig;
}

//

DisplayTriggers.prototype.load = function(extensionPreferences) {
	var locked = 1;
	
	if(!extensionPreferences.locked)
		locked = 0;

	var extensionConfig = {
		'displayTitle': $L("Display State"),
		'displayLocked': locked };
	
	return extensionConfig;
}

DisplayTriggers.prototype.save = function(extensionConfig) {
	var locked = true;

	if(extensionConfig.displayLocked == 0)
		locked = false;

	var extensionPreferences = {
		'locked': locked };
	
	return extensionPreferences;
}

//

DisplayTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "DisplayStateHelp") {
		var helpTitle = "State";

		var helpText = "State of the display when the mode should be active.";
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

