function BatteryTriggers(controller) {
	this.controller = controller;
}

//

BatteryTriggers.prototype.basic = function() {
	return false;
}

//

BatteryTriggers.prototype.label = function() {
	return $L("Battery Level Trigger");
}

//

BatteryTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesHighLimitSelector = [
		{'label': "100%", 'value': 100}, 
		{'label': "95%", 'value': 95}, {'label': "90%", 'value': 90}, 
		{'label': "85%", 'value': 85}, {'label': "80%", 'value': 80}, 
		{'label': "75%", 'value': 75}, {'label': "70%", 'value': 70}, 
		{'label': "65%", 'value': 65}, {'label': "60%", 'value': 60}, 
		{'label': "55%", 'value': 55}, {'label': "50%", 'value': 50}, 
		{'label': "45%", 'value': 45}, {'label': "40%", 'value': 40}, 
		{'label': "35%", 'value': 35}, {'label': "30%", 'value': 30}, 
		{'label': "25%", 'value': 25}, {'label': "20%", 'value': 20}, 
		{'label': "15%", 'value': 15}, {'label': "10%", 'value': 10}, 
		{'label': "5%", 'value': 5}, {'label': "0%", 'value': 0}];  

	this.controller.setupWidget("BatteryHighSelector", {'label': $L("High Limit"), 
		'labelPlacement': "left", 'modelProperty': "batteryHigh",
		'choices': this.choicesHighLimitSelector});
	
	this.choicesLowLimitSelector = [
		{'label': "0%", 'value': 0}, {'label': "5%", 'value': 5},
		{'label': "10%", 'value': 10}, {'label': "15%", 'value': 15},
		{'label': "20%", 'value': 20}, {'label': "25%", 'value': 25},
		{'label': "30%", 'value': 30}, {'label': "35%", 'value': 35},
		{'label': "40%", 'value': 40}, {'label': "45%", 'value': 45},
		{'label': "50%", 'value': 50}, {'label': "55%", 'value': 55},
		{'label': "60%", 'value': 60}, {'label': "65%", 'value': 65},
		{'label': "70%", 'value': 70}, {'label': "75%", 'value': 75},
		{'label': "80%", 'value': 80}, {'label': "85%", 'value': 85},
		{'label': "90%", 'value': 90}, {'label': "95%", 'value': 95},
		{'label': "100%", 'value': 100}];  

	this.controller.setupWidget("BatteryLowSelector", {'label': $L("Low Limit"), 
		'labelPlacement': "left", 'modelProperty': "batteryLow",
		'choices': this.choicesLowLimitSelector});

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
}

//

BatteryTriggers.prototype.config = function() {
	var extensionConfig = {
		'batteryTitle': $L("Battery Level"),
		'batteryHigh': 100,
		'batteryLow': 0 };
	
	return extensionConfig;
}

//

BatteryTriggers.prototype.load = function(extensionPreferences) {
	var extensionConfig = {
		'batteryTitle': $L("Battery Level"),
		'batteryHigh': extensionPreferences.levelHigh,
		'batteryLow': extensionPreferences.levelLow };
	
	return extensionConfig;
}

BatteryTriggers.prototype.save = function(extensionConfig) {
	var extensionPreferences = {
		'levelHigh': extensionConfig.batteryHigh,
		'levelLow': extensionConfig.batteryLow };
	
	return extensionPreferences;
}

//

BatteryTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "BatteryHighHelp") {
		var helpTitle = "High Limit";

		var helpText = "The high limit for when the mode is active. Mode is closed when battery level gets higher than this value and started when battery level gets to this or to lower level.";
	}
	else if(event.originalEvent.target.id == "BatteryLowHelp") {
		var helpTitle = "Low Limit";

		var helpText = "The low limit for when the mode is active. Mode is closed when battery level gets lower than this value and started when battery level gets to this or higher level.";
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

