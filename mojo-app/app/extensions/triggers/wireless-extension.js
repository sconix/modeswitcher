function WirelessTriggers(controller) {
	this.controller = controller;
}

//

WirelessTriggers.prototype.basic = function() {
	return true;
}

//

WirelessTriggers.prototype.label = function() {
	return $L("Wi-Fi Network Trigger");
}

//

WirelessTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesWiFiStateSelector = [
		{'label': $L("Connected"), 'value': 0},
		{'label': $L("Disconnected"), 'value': 1},
		{'label': $L("Connected to"), 'value': 2},
		{'label': $L("Disconnected from"), 'value': 3} ];  

	this.controller.setupWidget("WirelessStateSelector", {'label': $L("State"), 
		'labelPlacement': "left", 'modelProperty': "wirelessState",
		'choices': this.choicesWiFiStateSelector});

	this.controller.setupWidget("WirelessSSIDText", {'hintText': $L("Wi-Fi Network Name (SSID)"), 
		'multiline': false, 'enterSubmits': false, 'focus': true, 
		'textCase': Mojo.Widget.steModeLowerCase, 'modelProperty': "wirelessSSID"}); 

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	// Listen for state selector change event

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
}

//

WirelessTriggers.prototype.config = function() {
	var extensionConfig = {
		'wirelessTitle': $L("Wi-Fi Network"),
		'wirelessStateRow': "single",
		'wirelessSSIDDisplay': "none",
		'wirelessState': 0,
		'wirelessSSID': "" };
	
	return extensionConfig;
}

//

WirelessTriggers.prototype.load = function(extensionPreferences) {
	var row = "single";	
	var display = "none";

	if(extensionPreferences.state >= 2) {
		var row = "first";
		var display = "block";
	}

	var extensionConfig = {
		'wirelessTitle': $L("Wi-Fi Network"),
		'wirelessStateRow': row,
		'wirelessSSIDDisplay': display,
		'wirelessState': extensionPreferences.state,
		'wirelessSSID': extensionPreferences.ssid };
	
	return extensionConfig;
}

WirelessTriggers.prototype.save = function(extensionConfig) {
	var extensionPreferences = {
		'state': extensionConfig.wirelessState,
		'ssid': extensionConfig.wirelessSSID };
	
	return extensionPreferences;
}

//

WirelessTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "WirelessStateHelp") {
		var helpTitle = "State";

		var helpText = "When the mode should be started / closed. Mode can be set to be active when connected / disconnected to certain wireless network.";
	}
	else if(event.originalEvent.target.id == "WirelessSSIDHelp") {
		var helpTitle = "SSID";

		var helpText = "SSID limitation for the wireless networks that activate the mode.";
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

WirelessTriggers.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "wirelessState") {
		changeEvent.model.wirelessStateRow = "single";
		changeEvent.model.wirelessSSIDDisplay = "none";

		if(changeEvent.value >= 2) {
			changeEvent.model.wirelessStateRow = "first";
			changeEvent.model.wirelessSSIDDisplay = "block";
		}

		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("TriggersList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
}

