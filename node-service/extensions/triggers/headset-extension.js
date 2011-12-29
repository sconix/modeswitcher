/*
	Headset Configuration Object:
	
	state:						integer,
	scenario:					integer
	
	Headset Status Object:
	
	activity:					integer,
	scenario:					string
*/

var headsetTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config) {
		var future = new Future();
		
		future.nest(PalmCall.call("palm://com.palm.audio/media", "status", {}));
		
		future.then(this, function(future) {
			config.scenario = future.result.scenario;
			
			future.result = true;
		});
		
		return future;
	};
	
//
	
	var addActivity = function(config) {
		var future = new Future();
		
		var newActivity = {
			"start" : true,
			"replace": true,
			"activity": {
				"name": "headsetTrigger",
				"description" : "Headset Scenario Notifier",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"trigger" : {
					"method" : "palm://com.palm.audio/media/status",
					"params" : {'subscribe': true}
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "headset"}
				}
			}
		};
		
		future.nest(PalmCall.call("palm://com.palm.activitymanager", "create", newActivity));
		
		future.then(this, function(future) {
			config.activity = future.result.activityId;
			
			future.result = true;
		});
		
		return future;
	};
	
	var delActivity = function(config) {
		var future = new Future();
		
		var oldActivity = {
			"activityId": config.activity
		};
		
		future.nest(PalmCall.call("palm://com.palm.activitymanager", "cancel", oldActivity));
		
		future.then(this, function(future) {
			config.activity = null;
			
			future.result = true;
		});
		
		return future;
	};
	
//
	
	var checkState = function(config, trigger) {
		if((trigger.state == 0) && (trigger.scenario == 0) && 
			((config.scenario == "media_headset") ||
			(config.scenario == "media_headset_mic")))
		{
			return true;
		}
		else if((trigger.state == 0) && (trigger.scenario == 1) && 
			(config.scenario == "media_headset"))
		{
			return true;
		}
		else if((trigger.state == 0) && (trigger.scenario == 2) && 
			(config.scenario == "media_headset_mic"))
		{
			return true;
		}
		else if((trigger.state == 1) && (trigger.scenario == 0) && 
			(config.scenario != "media_headset") &&
			(config.scenario != "media_headset_mic"))
		{
			return true;
		}
		else if((trigger.state == 1) && (trigger.scenario == 1) && 
			(config.scenario != "media_headset"))
		{
			return true;
		}
		else if((trigger.state == 1) && (trigger.scenario == 2) && 
			(config.scenario != "media_headset_mic"))
		{
			return true;
		}
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		if((args.$activity) && (args.$activity.trigger) && 
			(args.$activity.trigger.scenario != undefined) && 
			(config.scenario != args.$activity.trigger.scenario))
		{
			return true;
		}
		
		return false;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.scenario = "unknown";
		
		var future = new Future();
		
		if(triggers.length == 0)
			future.result = { returnValue: true };
		else {
			future.nest(initExtension(config));
			
			future.then(this, function(future) {
				future.nest(addActivity(config));
				
				future.then(this, function(future) {
					future.result = { returnValue: true };
				});
			});
		}
		
		return future;
	};
	
	that.shutdown = function(config) {
		config.scenario = "unknown";
		
		var future = new Future();
		
		if(!config.activity)
			future.result = { returnValue: true };
		else {
			future.nest(delActivity(config));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		}
		
		return future;
	};
	
//
	
	that.reload = function(config, triggers, args) {
		config.activity = null;
		config.scenario = "unknown";
		
		var future = new Future();
		
		if((triggers.length == 0) ||
			(!args.$activity) || (!args.$activity.trigger) || 
			(args.$activity.trigger.returnValue == false))
		{
			future.result = { returnValue: true };
		}
		else {
			if(args.$activity.trigger.scenario != undefined)
				config.scenario = args.$activity.trigger.scenario;
			else
				config.scenario = "unknown";
			
			future.nest(addActivity(config));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		}
		
		return future;
	};
	
// Synchronous public functions
	
	that.check = function(config, trigger) {
		return checkState(config, trigger);
	};
	
	that.trigger = function(config, trigger, args) {
		return triggerState(config, trigger, args);
	};
	
	return that;
}());
