function CaleventTriggers(controller) {
	this.controller = controller;
}

//

CaleventTriggers.prototype.basic = function() {
	return true;
}

//

CaleventTriggers.prototype.label = function() {
	return $L("Calendar Event Trigger");
}

//

CaleventTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesCaleventCalendarSelector = [
		{'label': $L("Any Calendar"), 'value': "any"} ];
		
	this.controller.setupWidget("CaleventCalendarSelector", {'label': $L("Calendar"),
		'labelPlacement': "left", 'modelProperty': "caleventCalendar",
		'choices': this.choicesCaleventCalendarSelector});

	this.choicesCaleventMatchSelector = [
		{'label': $L("Match"), 'value': "match"},
		{'label': $L("No Match"), 'value': "nomatch"} ];
		
	this.controller.setupWidget("CaleventMatchSelector", {'label': $L("Active On"),
		'labelPlacement': "left", 'modelProperty': "caleventMode",
		'choices': this.choicesCaleventMatchSelector});

	this.controller.setupWidget("CaleventMatchText", {'hintText': $L("Text to Match in Events"), 
		'multiline': false, 'enterSubmits': false, 'focus': true, 
		'textCase': Mojo.Widget.steModeLowerCase, 'modelProperty': "caleventMatch"}); 

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));

	this.retrieveCalendarAccounts();
}

//

CaleventTriggers.prototype.config = function() {
	var extensionConfig = {
		'caleventTitle': $L("Calendar Event"),
		'caleventCalendar': "any",
		'caleventMode': "match",
		'caleventMatch': "" };
	
	return extensionConfig;
}

//

CaleventTriggers.prototype.load = function(extensionPreferences) {
	var extensionConfig = {
		'caleventTitle': $L("Calendar Event"),
		'caleventCalendar': extensionPreferences.calendar,
		'caleventMode': extensionPreferences.matchMode,
		'caleventMatch': extensionPreferences.matchText };
	
	return extensionConfig;
}

CaleventTriggers.prototype.save = function(extensionConfig) {
	var extensionPreferences = {
		'calendar': extensionConfig.caleventCalendar,
		'matchMode': extensionConfig.caleventMode,
		'matchText': extensionConfig.caleventMatch };
	
	return extensionPreferences;
}

//

CaleventTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "CaleventCalendarHelp") {
		var helpTitle = "Calendar";

		var helpText = "Calendar limitation for mode being started / closed.";
	}
	else if(event.originalEvent.target.id == "CaleventMatchHelp") {
		var helpTitle = "Active On";

		var helpText = "Controls when the mode is active, when the text below is matched or when its not matched to the calendar event.";
	}
	else if(event.originalEvent.target.id == "CaleventTextHelp") {
		var helpTitle = "Text to Match";

		var helpText = "Text to be matched on calendar events subject / location / note fields.";
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

CaleventTriggers.prototype.retrieveCalendarAccounts = function() {
	this.controller.serviceRequest('palm://org.e.lnx.wee.modeswitcher.sys/', {'method': "systemCall",
		'parameters': {'id': "com.palm.app.calendar", 'service': "com.palm.db", 'method': "find", 
			'params': {'query': {'from':"com.palm.calendar:1"}}},
		'onSuccess': this.handleCalendarAccounts.bind(this) });
}

CaleventTriggers.prototype.handleCalendarAccounts = function(serviceResponse) {
	this.choicesCaleventCalendarSelector.clear();
	
	this.choicesCaleventCalendarSelector.push({'label': $L("Any Calendar"), 'value': "any"});

	for(var i = 0; i < serviceResponse.results.length; i++) {
		this.choicesCaleventCalendarSelector.push({
			'label': serviceResponse.results[i].name, 
			'value': serviceResponse.results[i]._id});
	}
	
	var state = this.controller.get('mojo-scene-mode-scene-scroller').mojo.getState();

	this.controller.get("TriggersList").mojo.invalidateItems(0);
	
	this.controller.get('mojo-scene-mode-scene-scroller').mojo.setState(state);	
}

