var TriggerCommandAssistant = function() {
}

//

TriggerCommandAssistant.prototype.setup = function() {
}

TriggerCommandAssistant.prototype.run = function(future) {
	console.error("MS - Trigger - Run - " + JSON.stringify(this.controller.args));	
	
	this.controller.service.assistant.appendProcess(future, 
		this.controller.args, this.process.bind(this));
}

TriggerCommandAssistant.prototype.cleanup = function() {
}

//

TriggerCommandAssistant.prototype.process = function(future, args) {
	console.error("MS - Trigger - Process - " + JSON.stringify(args));
	
	future.nest(prefs.load());
	
	future.then(this, function(future) {
		var config = future.result;
		
		if(config.activated == false)
			future.result = { returnValue: false, errorText: "Not activated" };
		else if((!args) || (!args.extension))
			future.result = { returnValue: false, errorText: "No extension set" };
		else if(config.extensions.triggers.indexOf(args.extension) == -1)
			future.result = { returnValue: false, errorText: "Unknown extension" };
		else if(config.statusData.triggers[args.extension] == undefined)
			future.result = { returnValue: false, errorText: "Uninitialized extension" };
		else
			this.checkTriggerEvent(future, config, args);
	});
}

//

TriggerCommandAssistant.prototype.checkTriggerEvent = function(future, config, args) {
	var triggersData = [];
	var triggeredModes = [];
	
	var configData = config.statusData.triggers[args.extension];
	
	for(var i = 0; i < config.customModes.length; i++) {
		for(var j = 0; j < config.customModes[i].triggers.length; j++) {
			for(var k = 0; k < config.customModes[i].triggers[j].list.length; k++) {
				if(config.customModes[i].triggers[j].list[k].extension == args.extension) {
					var triggerData = config.customModes[i].triggers[j].list[k];
					
					eval("var triggered = " + args.extension + "Triggers.trigger(configData, triggerData, args);");
					
					triggersData.push(config.customModes[i].triggers[j].list[k]);
					
					if(triggered) {
						if(utils.findArray(triggeredModes, "name", config.customModes[i].name) == -1)
							triggeredModes.push(config.customModes[i]);
					}
				}
			}
		}
	}
	
	console.error("MS - Trigger - Check " + triggeredModes.length + " " + triggersData.length);
	
	eval("future.nest(" + args.extension + "Triggers.reload(configData, triggersData, args));");
	
	future.then(this, function(future) {
		var newConfig = {statusData: {triggers: {}}};
		
		newConfig.statusData.triggers[args.extension] = config.statusData.triggers[args.extension];
		
		future.nest(prefs.save(newConfig));
		
		future.then(this, function(future) {
			if(future.result.returnValue != true)
				future.result = { returnValue: false };
			else {
				if(config.modeLocked == true)
					future.result = { returnValue: true };
				else if(triggeredModes.length == 0)
					future.result = { returnValue: true };
				else
					this.handleModeLaunching(future, config, triggeredModes);
			}
		});
	});
}

TriggerCommandAssistant.prototype.handleModeLaunching = function(future, config, triggeredModes) {
	var usePopup = false, startNModes = [], startMModes = [], closeNModes = [], closeMModes = [];
	
	// Determine the modes which should be started and / or closed.
	
	for(var i = 0; i < triggeredModes.length; i++) {
		if(utils.findArray(config.activeModes, "name", triggeredModes[i].name) == -1) {
			if(triggeredModes[i].start != 0) {
				if(this.checkModeTriggers(future, config, triggeredModes[i])) {
					if(triggeredModes[i].start != 3)
						usePopup = true;
					
					if(triggeredModes[i].type == "normal") {
						startNModes.push({
							name: triggeredModes[i].name,
							start: triggeredModes[i].start,
							notify: triggeredModes[i].notify });
					}
					else if(triggeredModes[i].type == "modifier") {
						startMModes.push({
							name: triggeredModes[i].name,
							start: triggeredModes[i].start,
							notify: triggeredModes[i].notify });
					}
				}
			}
		}
		else if(triggeredModes[i].close != 0) {
			if(!this.checkModeTriggers(future, config, triggeredModes[i])) {
				if(triggeredModes[i].close != 3)
					usePopup = true;
				
				if(triggeredModes[i].type == "normal") {
					closeNModes.push({
						name: triggeredModes[i].name,
						close: triggeredModes[i].close,
						notify: triggeredModes[i].notify });
				}
				else if(triggeredModes[i].type == "modifier") {
					closeMModes.push({
						name: triggeredModes[i].name,
						close: triggeredModes[i].close,
						notify: triggeredModes[i].notify });
				}
			}
		}
	}
	
	console.error("MS - Trigger - Launch " + startNModes.length + " " + closeNModes.length + " " + startMModes.length + " " + closeMModes.length);
	
	if((startNModes.length == 0) && (startMModes.length == 0) && 
		(closeNModes.length == 0) && (closeMModes.length == 0))
	{
		future.result = { returnValue: true };
	}
	else if((!usePopup) && (startNModes.length < 2) && (closeNModes.length < 2))
		this.executeModeLaunching(future, config, startNModes, startMModes, closeNModes, closeMModes);
	else
		this.executePopupLaunching(future, config, startNModes, startMModes, closeNModes, closeMModes);
}

TriggerCommandAssistant.prototype.executeModeLaunching = function(future, config, startNModes, startMModes, closeNModes, closeMModes) {
	var newModes = [config.activeModes[0].name];
	
	if(startNModes.length == 1)
		newModes[0] = startNModes[0].name;
	
	if(closeNModes.length == 1)
		newModes[0] = "Default Mode";
	
	for(var i = 1; i < config.activeModes.length; i++) {
		if(utils.findArray(closeMModes, "name", config.activeModes[i].name) == -1)
			newModes.push(config.activeModes[i].name);
	}
	
	for(var i = 1; i < config.customModes.length; i++) {
		if(utils.findArray(startMModes, "name", config.customModes[i].name) != -1)
			newModes.push(config.customModes[i].name);
	}
	
	future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.srv", "execute", {
		'action': "update", 'names': newModes, 'notify': true}));
	
	future.result = { returnValue: true };
}

TriggerCommandAssistant.prototype.executePopupLaunching = function(future, config, startNModes, startMModes, closeNModes, closeMModes) {
	// Form notify setting based on all triggered modes
	
	var notify = config.customModes[0].notify;
	
	for(var i = 0; i < closeMModes.length; i++) {
		if(closeMModes[i].notify > notify)
			notify = closeMModes[i].notify;
	}
	
	for(var i = 0; i < closeNModes.length; i++) {
		if(closeNModes[i].notify > notify)
			notify = closeNModes[i].notify;
	}
	
	for(var i = 0; i < startMModes.length; i++) {
		if(startMModes[i].notify > notify)
			notify = startMModes[i].notify;
	}
	
	for(var i = 0; i < startNModes.length; i++) {
		if(startNModes[i].notify > notify)
			notify = startNModes[i].notify;
	}
	
	// Form new modes list based on modes not needing popup
	
	var newModes = [config.activeModes[0].name];
	
	if((closeNModes.length == 1) && (closeNModes[0].close == 3)) {
		newModes[0] = "Default Mode";
	
		closeNModes = [];
	}
	
	if((startNModes.length == 1) && (startNModes[0].start == 3)) {
		newModes[0] = startNModes[0].name;
	
		startNModes = [];
	}
	
	for(var i = 1; i < config.activeModes.length; i++) {
		var index = utils.findArray(closeMModes, "name", config.activeModes[i].name);
		
		if((config.activeModes[i].close != 3) || (index == -1))
			newModes.push(config.activeModes[i].name);
		else if(index != -1)
			closeMModes.splice(index, 1);
	}
	
	for(var i = 1; i < config.customModes.length; i++) {
		var index = utils.findArray(startMModes, "name", config.customModes[i].name);
		
		if((config.customModes[i].start == 3) && (index != -1)) {
			startMModes.splice(index, 1);
			
			newModes.push(config.customModes[i].name);
		}
	}
	
	future.nest(PalmCall.call("palm://com.palm.applicationManager/", "launch", {
		'id': "org.e.lnx.wee.modeswitcher", 'params': { 'action': "popup", 
			'notify': notify, 'names': newModes, 'modes': { 'startN': startNModes, 
				'closeN': closeNModes, 'startM': startMModes, 'closeM': closeMModes},
			'timers': {'start': config.startTimer, 'close': config.closeTimer}}}));
	
	future.then(this, function(future) { future.result = { returnValue: true }; });
}

//

TriggerCommandAssistant.prototype.checkModeTriggers = function(future, config, mode) {
	// If mode does not have triggers then always return true.
	
	if(mode.triggers.length == 0)
		return true;
	
	// Loop through triggers in all groups and test are they valid or not.
	
	for(var group = 0; group < mode.triggers.length; group++) {
		var groupState = "unknown";
		
		var require = mode.triggers[group].require;
			
		for(var i = 0; i < config.extensions.triggers.length; i++) {
			var triggerState = "unknown";

			for(var j = 0; j < mode.triggers[group].list.length; j++) {
				var extension = mode.triggers[group].list[j].extension;
				
				if(config.extensions.triggers[i] == extension) {
					var configData = config.statusData.triggers[extension];
					
					var triggerData = mode.triggers[group].list[j];
					
					eval("groupState = triggerState = " + extension + 
						"Triggers.check(configData, triggerData);");

					if(((triggerState == true) && (require == 0)) ||
						((triggerState == true) && (require == 1)) ||
						((triggerState == false) && (require == 2)))
					{
						break;
					}
				}
			}
			
			// Check the global state for triggers with same extension
			
			if(((triggerState == false) && (require == 0)) ||
				((triggerState == true) && (require == 1)) ||
				((triggerState == false) && (require == 2)))
			{
				break;
			}
		}

		if(groupState == true)
			return true;
	}
	
	return false;
}
