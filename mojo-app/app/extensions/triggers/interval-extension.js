function IntervalTriggers(controller) {
	this.controller = controller;
}

//

IntervalTriggers.prototype.basic = function() {
	return true;
}

//

IntervalTriggers.prototype.label = function() {
	return $L("Time Interval Trigger");
}

//

IntervalTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.controller.setupWidget("IntervalIntervalHours",
	 	{label: ' ', modelProperty: 'intervalIntervalHours', min: 0, max: 24 }); 

	this.controller.setupWidget("IntervalIntervalMinutes",
	 	{label: ' ', modelProperty: 'intervalIntervalMinutes', min: 0, max: 60 }); 

	this.controller.setupWidget("IntervalActiveHours",
	 	{label: ' ', modelProperty: 'intervalActiveHours', min: 0, max: 24 }); 

	this.controller.setupWidget("IntervalActiveMinutes",
	 	{label: ' ', modelProperty: 'intervalActiveMinutes', min: 0, max: 60 }); 

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

IntervalTriggers.prototype.config = function() {
	var extensionConfig = {
		'intervalTitle': $L("Time Interval"),
		'intervalIntervalHours': 0,
		'intervalIntervalMinutes': 0,
		'intervalActiveHours': 0,
		'intervalActiveMinutes': 0 };
	
	return extensionConfig;
}

//

IntervalTriggers.prototype.load = function(extensionPreferences) {
	var extensionConfig = {
		'intervalTitle': $L("Time Interval"),
		'intervalIntervalHours': extensionPreferences.intervalHours,
		'intervalIntervalMinutes': extensionPreferences.intervalMinutes,
		'intervalActiveHours': extensionPreferences.activeHours,
		'intervalActiveMinutes': extensionPreferences.activeMinutes };

	return extensionConfig;
}

IntervalTriggers.prototype.save = function(extensionConfig) {
	var extensionPreferences = {
		'intervalHours': extensionConfig.intervalIntervalHours,
		'intervalMinutes': extensionConfig.intervalIntervalMinutes,
		'activeHours': extensionConfig.intervalActiveHours, 
		'activeMinutes': extensionConfig.intervalActiveMinutes };
	
	return extensionPreferences;
}

//

IntervalTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "IntervalIntervalHelp") {
		var helpTitle = "Interval";

		var helpText = "The interval (hours and minutes) for when the mode should be started.";
	}
	else if(event.originalEvent.target.id == "IntervalActiveHelp") {
		var helpTitle = "Active";

		var helpText = "The active time (hours and minutes) of the mode. Mode is active for this time and closes after this time has passed.";
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

