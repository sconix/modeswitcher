/*
	Calendar Configuration Object:
	
	databaseId:				string,
	blinkNotify:			boolean,
	reminderAlert: 		integer,
	ringtoneName:			string,
	ringtonePath:			string
*/

var calendarSettings = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var Future = Foundations.Control.Future;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
//
	
	var updateSettings = function(settingsOld, settingsNew) {
		var future = new Future();
		
		var params = {};
		
		if(settingsNew.databaseId != undefined) {
			params._id = settingsNew.databaseId;
			
			if((settingsNew.blinkNotify != undefined) && (settingsOld.blinkNotify != settingsNew.blinkNotify))
				params.blinkNotification = settingsNew.blinkNotify;
			
			if((settingsNew.reminderAlert != undefined) && (settingsOld.reminderAlert != settingsNew.reminderAlert))
				params.alarmSoundOn = settingsNew.reminderAlert;
			
			if((settingsNew.ringtonePath != undefined) && (settingsOld.ringtonePath != settingsNew.ringtonePath)) {
				params.ringtoneName = settingsNew.ringtoneName;
				params.ringtonePath = settingsNew.ringtonePath;
			}
		}
		
		if((params.blinkNotification != undefined) || (params.alarmSoundOn != undefined) || 
			(params.ringtonePath != undefined))
		{
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.calendar", 'service': "com.palm.db", 
				'method': "merge", 'params': {'objects': [params]}}));
			
			future.then(this, function(future) { future.result = true; });
		}
		else
			future.result = true;
		
		return future;
	};
	
//
	
	that.update = function(settingsOld, settingsNew) {
		var future = new Future();
		
		future.nest(updateSettings(settingsOld, settingsNew));
		
		future.then(this, function(future) {
			future.result = { returnValue: true };
		});
		
		return future;
	};
	
	return that;
}());
