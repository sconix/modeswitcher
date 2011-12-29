/*
	Screen Configuration Object:
	
	brightnessLevel:		integer,
	turnOffTimeout:		integer,
	blinkNotify: 			boolean,
	lockedNotify: 			boolean,
	wallpaperName: 		string,
	wallpaperPath: 		string
*/

var screenSettings = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var Future = Foundations.Control.Future;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
//
	
	var updateSettings1 = function(settingsOld, settingsNew) {
		var future = new Future();
		
		var params = {};
		
		if((settingsNew.brightnessLevel != undefined) && (settingsOld.brightnessLevel != settingsNew.brightnessLevel))
			params.maximumBrightness = parseInt(settingsNew.brightnessLevel);
		
		if((settingsNew.turnOffTimeout != undefined) && (settingsOld.turnOffTimeout != settingsNew.turnOffTimeout))
			params.timeout = parseInt(settingsNew.turnOffTimeout);
		
		if((params.maximumBrightness != undefined) || (params.timeout != undefined)) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.screenandlock", 'service': "com.palm.display/control", 
				'method': "setProperty", 'params': params}));
			
			future.then(this, function(future) { future.result = true; });
		}
		else
			future.result = true;
		
		return future;
	};
	
	var updateSettings2 = function(settingsOld, settingsNew) {
		var future = new Future();
		
		var params = {};
		
		if((settingsNew.blinkNotify != undefined) && (settingsOld.blinkNotify != settingsNew.blinkNotify))
			params.BlinkNotifications = settingsNew.blinkNotify;
		
		if((settingsNew.lockedNotify != undefined) && (settingsOld.lockedNotify != settingsNew.lockedNotify))
			params.showAlertsWhenLocked = settingsNew.lockedNotify;
		
		if((settingsNew.wallpaperPath != undefined) && (settingsOld.wallpaperPath != settingsNew.wallpaperPath)) {
			params.wallpaper = {
				'wallpaperName': settingsNew.wallpaperName,
				'wallpaperFile': settingsNew.wallpaperPath };
		}
		
		if((params.BlinkNotifications != undefined) || (params.showAlertsWhenLocked != undefined) || 
			(params.wallpaper != undefined))
		{
			future.nest(PalmCall.call("palm://com.palm.systemservice/", "setPreferences", params));
			
			future.then(this, function(future) { future.result = true; });
		}
		else
			future.result = true;
		
		return future;
	};
	
//
	
	that.update = function(settingsOld, settingsNew) {
		var future = new Future();
		
		future.nest(updateSettings1(settingsOld, settingsNew));

		future.then(this, function(future) {
			future.nest(updateSettings2(settingsOld, settingsNew));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		});
		
		return future;
	};
	
	return that;
}());
