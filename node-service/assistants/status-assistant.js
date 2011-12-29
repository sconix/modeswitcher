var StatusCommandAssistant = function() {
}

//

StatusCommandAssistant.prototype.setup = function() {
	this.id = this.controller.message.applicationID().split(" ")[0];
}

StatusCommandAssistant.prototype.run = function(future, factory) {
	future.nest(prefs.load());
	
	future.then(this, function(future) {
		var config = future.result;
		
		if(this.controller.args.mode) {
			var mode = null;
			
			for(var i = 0; i < config.customModes.length; i++) {
				if(config.customModes[i].name == this.controller.args.mode) {
					mode = config.customModes[i];
					
					break;
				}
			}
			
			if(!mode) {
				future.result = { returnValue: false };
			}
			else {
				var status = this.checkModeStatus(config, mode);
				
				future.result = { 
					returnValue: true,
					
					groups: status.groups,
					triggers: status.triggers };
			}
		}
		else {
			if((this.controller.args.subscribe) && (this.id != "")) {
				var keys = ["activated", "modeLocked", "activeModes", "customModes"];
				
				prefs.addSubscription(this.id, keys, factory);
			}
			
			future.result = { 
				returnValue: true,
				
				activated: config.activated,
				modeLocked: config.modeLocked,
				
				activeModes: config.activeModes,
				customModes: config.customModes };
		}
	});
}

StatusCommandAssistant.prototype.cleanup = function() {
	prefs.delSubscription(this.id);
}

//

StatusCommandAssistant.prototype.checkModeStatus = function(config, mode) {
	var status = {groups: [], triggers: []};

	// Loop through triggers in all groups and test are they valid or not.
	
	for(var group = 0; group < mode.triggers.length; group++) {
		var groupDone = false;
		var groupState = "unknown";
		
		var require = mode.triggers[group].require;
		
		for(var i = 0; i < config.extensions.triggers.length; i++) {
			var triggerDone = false;
			var triggerState = "unknown";
			
			for(var j = 0; j < mode.triggers[group].list.length; j++) {
				var extension = mode.triggers[group].list[j].extension;
			
				if(config.extensions.triggers[i] == extension) {
					var configData = config.statusData.triggers[extension];
					
					var triggerData = mode.triggers[group].list[j];
					
					if((groupDone) || (triggerDone)) {
						eval("var tmpState = " + extension + 
							"Triggers.check(configData, triggerData);");

						status.triggers.push({"extension": extension, 
							'state': tmpState, 'group': group});
					}
					else {
						eval("groupState = triggerState = " + extension + 
							"Triggers.check(configData, triggerData);");

						status.triggers.push({"extension": extension, 
							'state': triggerState, 'group': group});

						if(((triggerState == true) && (require == 0)) ||
							((triggerState == true) && (require == 1)) ||
							((triggerState == false) && (require == 2)))
						{
							triggerDone = true;
						}
					}
				}
			}
			
			// Check the global state for triggers with same extension
			
			if(!groupDone) {
				if(((triggerState == false) && (require == 0)) ||
					((triggerState == true) && (require == 1)) ||
					((triggerState == false) && (require == 2)))
				{
					groupDone = true;
					
					if(groupState == true)
						status.groups[group] = true;
					else
						status.groups[group] = false;
				}
			}
		}
		
		if(!groupDone) {
			if(groupState == true)
				status.groups[group] = true;
			else
				status.groups[group] = false;
		}
	}
	
	return status;
}
