/*
	Battery Configuration Object:
	
	levelLow:						integer,
	levelHigh:						integer
	
	Battery Status Object:
	
	activity:						integer,
	current:							integer,
	active:							[string]
*/

var batteryTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config) {
		var future = new Future();
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.systemservice", 'service': "com.palm.systemservice", 
			'method': "getPreferences", 'params': {'keys': ["batteryLevel"]}}));
		
		future.then(this, function(future) {
			if(future.result.batteryLevel)
				config.current = future.result.batteryLevel;
			else
				config.current = 0;
			
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
				"name": "batteryTrigger",
				"description" : "Battery Level Notifier",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"trigger" : {
					"method" : "palm://com.palm.systemservice/getPreferences",
					"params" : {"subscribe": true, "keys": ["batteryLevel"]}
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "battery"}
				}
			}
		};
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.activitymanager", 'service': "com.palm.activitymanager", 
			'method': "create", 'params': newActivity}));
		
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
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.activitymanager", 'service': "com.palm.activitymanager", 
			'method': "cancel", 'params': oldActivity}));
		
		future.then(this, function(future) {
			config.activity = null;
			
			future.result = true;
		});
		
		return future;
	};
	
//
	
	var checkState = function(config, trigger) {
		if((trigger.levelLow <= config.current) && (trigger.levelHigh >= config.current))
			return true;
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		var triggerId = trigger.levelLow + "-" + trigger.levelHigh;
		
		if((args.$activity) && (args.$activity.trigger) && 
			(args.$activity.trigger.batteryLevel != undefined))
		{		
			if((config.active.indexOf(triggerId) == -1) && 
				(trigger.levelLow <= args.$activity.trigger.batteryLevel) &&
				(trigger.levelHigh >= args.$activity.trigger.batteryLevel))
			{
				return true;
			}
			else if((config.active.indexOf(triggerId) != -1) && 
				((trigger.levelLow > args.$activity.trigger.batteryLevel) ||
				(trigger.levelHigh < args.$activity.trigger.batteryLevel)))
			{
				return true;
			}
		}
		
		return false;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.current = 0;
		config.active = [];
		
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
		config.current = 0;
		config.active = [];
		
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
		config.current = 0;
		
		var future = new Future();
		
		if((triggers.length == 0) ||
			(!args.$activity) || (!args.$activity.trigger) || 
			(args.$activity.trigger.returnValue == false))
		{
			future.result = { returnValue: true };
		}
		else {
			if(args.$activity.trigger.batteryLevel != undefined) {
				config.current = args.$activity.trigger.batteryLevel;
				
				for(var i = 0; i < triggers.length; i++) {
					var triggerId = triggers[i].levelLow + "-" + triggers[i].levelHigh;
					
					var index = config.active.indexOf(triggerId);
					
					if((index == -1) && 
						(triggers[i].levelLow <= config.current) && 
						(triggers[i].levelHigh >= config.current))
					{
						config.active.push(triggerId);
					}
					else if((index != -1) && 
						((triggers[i].levelLow > config.current) ||
						(triggers[i].levelHigh < config.current)))
					{
						config.active.splice(index, 1);
					}
				}
			}
			
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
