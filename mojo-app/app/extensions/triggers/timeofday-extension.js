function TimeofdayTriggers(controller) {
	this.controller = controller;
}

//

TimeofdayTriggers.prototype.basic = function() {
	return true;
}

//

TimeofdayTriggers.prototype.label = function() {
	return $L("Time of Day Trigger");
}

//

TimeofdayTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesTimeSelector = [
		{'label': $L("Every Day"), 'value': 0},
		{'label': $L("Weekdays"), 'value': 1},
		{'label': $L("Weekends"), 'value': 2},
		{'label': $L("Custom"), 'value': 3} ];  

	this.controller.setupWidget("TimeofdayTimeSelector", { 'label': $L("Days"), 
		'labelPlacement': "left", 'modelProperty': "timeofdayDays",
		'choices': this.choicesTimeSelector});

	this.controller.setupWidget("DayCheckBoxMon", {'modelProperty': "timeofdayDay1"});
	this.controller.setupWidget("DayCheckBoxTue", {'modelProperty': "timeofdayDay2"});
	this.controller.setupWidget("DayCheckBoxWed", {'modelProperty': "timeofdayDay3"});
	this.controller.setupWidget("DayCheckBoxThu", {'modelProperty': "timeofdayDay4"});		
	this.controller.setupWidget("DayCheckBoxFri", {'modelProperty': "timeofdayDay5"});
	this.controller.setupWidget("DayCheckBoxSat", {'modelProperty': "timeofdayDay6"});
	this.controller.setupWidget("DayCheckBoxSun", {'modelProperty': "timeofdayDay0"});		

	this.controller.setupWidget("TimeofdayStartTime", {'label': $L("Start"), 
		'modelProperty': "timeofdayStart"});

	this.controller.setupWidget("TimeofdayCloseTime", {'label': $L("Close"), 
		'modelProperty': "timeofdayClose"});
	
	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
	
	// Listen for change event for day selector
	
	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
}

//

TimeofdayTriggers.prototype.config = function() {
	var startTime = new Date();
	var closeTime = new Date();

	startTime.setHours(0);
	startTime.setMinutes(0);
	startTime.setSeconds(0);
	startTime.setMilliseconds(0);

	closeTime.setHours(0);
	closeTime.setMinutes(0);
	closeTime.setSeconds(0);
	closeTime.setMilliseconds(0);

	var extensionConfig = {
		'timeofdayMon': $L("Mon"),
		'timeofdayTue': $L("Tue"),
		'timeofdayWed': $L("Wed"),
		'timeofdayThu': $L("Thu"),
		'timeofdayFri': $L("Fri"),
		'timeofdaySat': $L("Sat"),
		'timeofdaySun': $L("Sun"),
		'timeofdayTitle': $L("Time of Day"),
		'timeofdayDays': 0,
		'timeofdayCustom': "none",
		'timeofdayDay0': false,
		'timeofdayDay1': false,
		'timeofdayDay2': false,
		'timeofdayDay3': false,
		'timeofdayDay4': false,
		'timeofdayDay5': false,
		'timeofdayDay6': false,
		'timeofdayStart': startTime,
		'timeofdayClose': closeTime };
	
	return extensionConfig;
}

//

TimeofdayTriggers.prototype.load = function(extensionPreferences) {
	var startDate = new Date(extensionPreferences.startTime);
	var closeDate = new Date(extensionPreferences.closeTime);

	if(extensionPreferences.activeDays == 3)
		var display = "block";
	else
		var display = "none";

	var extensionConfig = {
		'timeofdayMon': $L("Mon"),
		'timeofdayTue': $L("Tue"),
		'timeofdayWed': $L("Wed"),
		'timeofdayThu': $L("Thu"),
		'timeofdayFri': $L("Fri"),
		'timeofdaySat': $L("Sat"),
		'timeofdaySun': $L("Sun"),
		'timeofdayTitle': $L("Time of Day"),
		'timeofdayCustom': display,
		'timeofdayDays': extensionPreferences.activeDays,
		'timeofdayDay0': extensionPreferences.customDays[0],
		'timeofdayDay1': extensionPreferences.customDays[1],
		'timeofdayDay2': extensionPreferences.customDays[2],
		'timeofdayDay3': extensionPreferences.customDays[3],
		'timeofdayDay4': extensionPreferences.customDays[4],
		'timeofdayDay5': extensionPreferences.customDays[5],
		'timeofdayDay6': extensionPreferences.customDays[6],
		'timeofdayStart': startDate,
		'timeofdayClose': closeDate };
	
	return extensionConfig;
}

TimeofdayTriggers.prototype.save = function(extensionConfig) {
	var days = new Array();

	for(var j = 0; j < 7; j++) {
		if(eval("extensionConfig.timeofdayDay" + j) == true)
			days.push(true);
		else
			days.push(false);
	}

	var extensionPreferences = {
		'activeDays': extensionConfig.timeofdayDays,
		'customDays': days,
		'startTime': extensionConfig.timeofdayStart.getTime(),
		'closeTime': extensionConfig.timeofdayClose.getTime() };
	
	return extensionPreferences;
}

//

TimeofdayTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "TimeofdayDaysHelp") {
		var helpTitle = "Days";

		var helpText = "Day limitation when the mode should be active.";
	}
	else if(event.originalEvent.target.id == "TimeofdayTimeHelp") {
		var helpTitle = "Start and Close Time";

		var helpText = "Time limitation when the mode should be active.";
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

TimeofdayTriggers.prototype.handleListChange = function(changeEvent) {
	if(changeEvent.property == "timeofdayDays") {
		if(changeEvent.model.timeofdayDays == 3)
			changeEvent.model.timeofdayCustom = "block";
		else
			changeEvent.model.timeofdayCustom = "none";
	
		var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

		this.controller.get("TriggersList").mojo.invalidateItems(0);
		
		this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);
	}
}

