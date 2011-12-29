/*
	Modechange Configuration Object:
	
	state:						string,
	mode:							string
	
	Modechange Status Object:
	
	activity:					integer,
	modes:						[strings]
*/

var modechangeTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config) {
		var future = new Future();
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.srv", "status", {}));
		
		future.then(this, function(future) {
			for(var i = 0; i < future.result.activeModes.length; i++)
				config.modes.push(future.result.activeModes[i].name);
			
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
				"name": "modechangeTrigger",
				"description" : "Mode Change Notifier",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"trigger" : {
					"method": "palm://org.e.lnx.wee.modeswitcher.srv/status", 
					"params": { 'subscribe': true } 
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "modechange"}
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
		if((trigger.state == "on") && (config.modes.indexOf(trigger.mode) != -1))
			return true
		
		if((trigger.state == "off") && (config.modes.indexOf(trigger.mode) == -1))
			return true
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		if((args.$activity) && (args.$activity.trigger) && 
			(args.$activity.trigger.activeModes))
		{
			if(config.modes.indexOf(trigger.mode) == -1) {
				for(var i = 0; i < args.$activity.trigger.activeModes.length; i++) {
					if(args.$activity.trigger.activeModes[i].name == trigger.mode)
						return true;
				}
			}
			else {
				for(var i = 0; i < args.$activity.trigger.activeModes.length; i++) {
					if(args.$activity.trigger.activeModes[i].name == trigger.mode)
						return false;
				}
				
				return true;
			}
		}
		
		return false;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.modes = [];
		
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
		config.modes = [];
		
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
		config.modes = [];
		
		var future = new Future();
		
		if((triggers.length == 0) ||
			(!args.$activity) || (!args.$activity.trigger) || 
			(args.$activity.trigger.returnValue == false))
		{
			future.result = { returnValue: true };
		}
		else {
			if(args.$activity.trigger.activeModes) {
				for(var i = 0; i < args.$activity.trigger.activeModes.length; i++)
					config.modes.push(args.$activity.trigger.activeModes[i].name);
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
