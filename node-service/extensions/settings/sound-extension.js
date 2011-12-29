/*
	Sound Configuration Object:
	
	ringerVolume: 				integer,
	systemVolume: 				integer,
	mediaVolume: 				integer
*/

var soundSettings = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var Future = Foundations.Control.Future;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
//
	
	var updateSettings1 = function(settingsOld, settingsNew) {
		var future = new Future();
		
		var params = {};
		
		if((settingsNew.ringerVolume != undefined) && (settingsOld.ringerVolume != settingsNew.ringerVolume))
			params.volume = parseInt(settingsNew.ringerVolume);
		
		if(params.volume != undefined) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/ringtone", 
				'method': "setVolume", 'params': params}));
			
			future.then(this, function(future) { future.result = true; });
		}
		else
			future.result = true;
		
		return future;
	};
	
	var updateSettings2 = function(settingsOld, settingsNew) {
		var future = new Future();
		
		var params = {};
		
		if((settingsNew.systemVolume != undefined) && (settingsOld.systemVolume != settingsNew.systemVolume))
			params.volume = parseInt(settingsNew.systemVolume);
		
		if(params.volume != undefined) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/system", 
				'method': "setVolume", 'params': params}));
			
			future.then(this, function(future) { future.result = true; });
		}
		else
			future.result = true;
		
		return future;
	};
	
	var updateSettings3 = function(settingsOld, settingsNew) {
		var future = new Future();
		
		var params = {'scenario': "media_back_speaker"};
		
		if((settingsNew.mediaVolume != undefined) && (settingsOld.mediaVolume != settingsNew.mediaVolume))
			params.volume = parseInt(settingsNew.mediaVolume);
		
		if(params.volume != undefined) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/media", 
				'method': "setVolume", 'params': params}));
			
			future.then(this, function(future) {
				params.scenario = "media_front_speaker";
				
				future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
					'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/media", 
					'method': "setVolume", 'params': params}));
				
				future.then(this, function(future) { 
					params.scenario = "media_headset";
					
					future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
						'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/media", 
						'method': "setVolume", 'params': params}));
					
					future.then(this, function(future) { 
						params.scenario = "media_headset_mic";
						
						future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
							'id': "com.palm.app.soundsandalerts", 'service': "com.palm.audio/media", 
							'method': "setVolume", 'params': params}));
						
						future.then(this, function(future) { future.result = true; });
					});
				});
			});
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
				future.nest(updateSettings3(settingsOld, settingsNew));
				
				future.then(this, function(future) {
					future.result = { returnValue: true };
				});
			});
		});
		
		return future;
	};
	
	return that;
}());
