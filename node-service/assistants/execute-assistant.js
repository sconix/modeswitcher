var ExecuteCommandAssistant = function() {
}

//

ExecuteCommandAssistant.prototype.setup = function() {
}

ExecuteCommandAssistant.prototype.run = function(future) {
	console.error("MS - Execute - Run - " + JSON.stringify(this.controller.args));

	this.controller.service.assistant.appendProcess(future, 
		this.controller.args, this.process.bind(this));
}

ExecuteCommandAssistant.prototype.cleanup = function() {
}

//

ExecuteCommandAssistant.prototype.process = function(future, args) {
	console.error("MS - Execute - Process - " + JSON.stringify(args));
	
	future.nest(prefs.load());
	
	future.then(this, function(future) {
		var config = future.result;
		
		if(config.activated == false)
			future.result = { returnValue: false, errorText: "Not activated" };
		else {
			if(args.action == "start")
				this.executeStartMode(future, config, args);
			else if(args.action == "close")
				this.executeCloseMode(future, config, args);
			else if(args.action == "toggle")
				this.executeToggleMode(future, config, args);
			else if(args.action == "reload")
				this.executeReloadMode(future, config, args);
			else if(args.action == "update")
				this.executeUpdateMode(future, config, args);
			else if(args.action == "trigger")
				this.executeTriggerMode(future, config, args);
		}
	});
}

//

ExecuteCommandAssistant.prototype.executeStartMode = function(future, config, args) {
	if(args.name) {
		console.error("Executing starting of: " + args.name);
		
		// Check and find information for requested mode.
		
		var requestedMode = null;
		
		if((args.name == "Current Mode") && (config.activeModes.length > 0))
			args.name = config.activeModes[0].name;
		else if((args.name == "Previous Mode") && (config.historyList.length > 0))
			args.name = config.historyList[0].name;
		
		var index = utils.findArray(config.customModes, "name", args.name);
		
		if(index != -1)
			requestedMode = config.customModes[index];
		
		// If requested mode not found then do nothing.
		
		if(requestedMode == null)
			future.result = { returnValue: false, errorText: "Mode not found" };
		else {
			// Define and locate original mode for update.
			
			var newActiveModes = [config.customModes[0]];
			
			if(requestedMode.type == "normal")
				newActiveModes[0] = requestedMode;
			else if((requestedMode.type == "modifier") && (config.activeModes.length > 0)) {
				var index = utils.findArray(config.customModes, "name", config.activeModes[0].name);
				
				if((index != -1) && (config.customModes[index].type == "normal"))
					newActiveModes[0] = config.customModes[index];
			}
			
			// Generate list of modifier modes for update.
			
			if(args.name != "Current Mode") {
				for(var i = 1; i < config.activeModes.length; i++) {
					var index = utils.findArray(config.customModes, "name", config.activeModes[i].name);
					
					if((index != -1) && (config.customModes[index].type == "modifier")) {
						if(config.activeModes[i].name != args.name)
							newActiveModes.push(config.customModes[index]);
					}
				}
			}
			
			if(requestedMode.type == "modifier")
				newActiveModes.push(requestedMode);
			
			// Notify about the mode starting.
			
			if(requestedMode.notify != 0)
				var notify = requestedMode.notify;
			else
				var notify = config.customModes[0].notify;
			
			if((requestedMode.type == "default") || (config.activeModes.length == 0)) {
				PalmCall.call("palm://com.palm.applicationManager/", "launch", {
					'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
					'notify': notify, 'name': requestedMode.name, 'event': "start"}});
			}
			else if(requestedMode.type == "normal") {
				PalmCall.call("palm://com.palm.applicationManager/", "launch", {
					'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
					'notify': notify, 'name': newActiveModes[0].name, 'event': "switch"}});
			}
			else if(requestedMode.type == "modifier") {
				PalmCall.call("palm://com.palm.applicationManager/", "launch", {
					'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
					'notify': notify, 'name': requestedMode.name, 'event': "start"}});
			}
			
			// Initiate the actual updating of the mode.
			
			this.prepareModeChange(future, config, newActiveModes, "init", 0);
		}
	}
	else {
		console.error("Start mode called without name!");
		
		future.result = { returnValue: false, errorText: "No name given" };
	}
}

ExecuteCommandAssistant.prototype.executeCloseMode = function(future, config, args) {
	if(args.name) {
		console.error("Executing closing of: " + args.name);
		
		// Check that requested mode is currently active.
		
		var requestedMode = null;
		
		if((args.name == "Current Mode") && (config.activeModes.length > 0))
			args.name = config.activeModes[0].name;
		else if((args.name == "Previous Mode") && (config.historyList.length > 0))
			args.name = config.historyList[0].name;
		
		var index = utils.findArray(config.customModes, "name", args.name);
		
		if(index != -1)
			requestedMode = config.customModes[index];
		
		// If requested mode not found then do nothing.
		
		if(requestedMode == null)
			future.result = { returnValue: false, errorText: "Mode not found" };
		else {
			// Define and locate original mode for update.
			
			var newActiveModes = [config.customModes[0]];
			
			if((requestedMode.type == "modifier") && (config.activeModes.length > 0)) {
				var index = utils.findArray(config.customModes, "name", config.activeModes[0].name);
				
				if((index != -1) && (config.customModes[index].type == "normal"))
					newActiveModes[0] = config.customModes[index];
			}
			
			// Generate list of modifier modes for update.
			
			if(args.name != "Current Mode") {
				for(var i = 1; i < config.activeModes.length; i++) {
					var index = utils.findArray(config.customModes, "name", config.activeModes[i].name);
					
					if((index != -1) && (config.customModes[index].type == "modifier")) {
						if(config.activeModes[i].name != args.name)
							newActiveModes.push(config.customModes[index]);
					}
				}
			}
			
			// Notify about the mode closing.
			
			if(requestedMode.notify != 0)
				var notify = requestedMode.notify;
			else
				var notify = config.customModes[0].notify;
			
			if(requestedMode.type == "default") {
				PalmCall.call("palm://com.palm.applicationManager/", "launch", {
					'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
					'notify': notify, 'name': requestedMode.name, 'event': "close"}});
			}
			else if(requestedMode.type == "normal") {
				PalmCall.call("palm://com.palm.applicationManager/", "launch", {
					'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
					'notify': notify, 'name': newActiveModes[0].name, 'event': "switch"}});
			}
			else if(requestedMode.type == "modifier") {
				PalmCall.call("palm://com.palm.applicationManager/", "launch", {
					'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
					'notify': notify, 'name': requestedMode.name, 'event': "close"}});
			}			
			
			// Initiate the actual updating of the mode.
			
			this.prepareModeChange(future, config, newActiveModes, "init", 0);
		}
	}
	else {
		console.error("Close mode called without name!");
		
		future.result = { returnValue: false, errorText: "No name given" };
	}
}

ExecuteCommandAssistant.prototype.executeToggleMode = function(future, config, args) {
	if(args.name) {
		console.error("Executing toggling of: " + args.name);
		
		if((args.name == "Current Mode") && (config.activeModes.length > 0))
			args.name = config.activeModes[0].name;
		else if((args.name == "Previous Mode") && (config.historyList.length > 0))
			args.name = config.historyList[0].name;
		
		if(utils.findArray(config.activeModes, "name", args.name) != -1)
			this.executeCloseMode(future, config, args);
		else if(utils.findArray(config.customModes, "name", args.name) != -1)
			this.executeStartMode(future, config, args);
		else {
			PalmCall.call("palm://com.palm.applicationManager/", "launch", {
				'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
				'notify': 5, 'name': args.name, 'event': "unknown"}});
			
			future.result = { returnValue: false, errorText: "Mode not found" };
		}
	}
	else {
		console.error("Toggle mode called without name!");
		
		future.result = { returnValue: false, errorText: "No name given" };
	}
}

ExecuteCommandAssistant.prototype.executeReloadMode = function(future, config, args) {
	if(args.name) {
		if(config.activeModes.length == 0) {
			console.error("Executing reloading of: Default Mode");
			
			this.executeStartMode(future, config, {name: "Default Mode"});
		}
		else {
			console.error("Executing reloading of: Current Mode");
			
			// On reload inform the user even if notifications are disabled.

			PalmCall.call("palm://com.palm.applicationManager/", "launch", {
				'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
				'notify': 2, 'name': "Current Mode", 'event': "reload"}});
			
			if((config.activeModes.length > 0) && (config.customModes.length > 0)) {
				var curActiveModes = [config.customModes[0]];
				
				// Check that original mode still exists and triggers are valid.
				
				var index = utils.findArray(config.customModes, "name", config.activeModes[0].name);
				
				if((index != -1) && (config.customModes[index].type == "normal")) {
					if(this.checkModeTriggers(future, config, config.customModes[index]))
						curActiveModes[0] = config.customModes[index];
				}
				
				// Check that modifier modes still exists and triggers are valid.
				
				for(var i = 1; i < config.activeModes.length; i++) {
					var index = utils.findArray(config.customModes, "name", config.activeModes[i].name);
					
					if((index != -1) && (config.customModes[index].type == "modifier")) {
						if(this.checkModeTriggers(future, config, config.customModes[index]))
							curActiveModes.push(config.customModes[index]);
					}
				}
				
				// Execute the actual updating of current mode (if there's changes).
				
				this.prepareModeChange(future, config, curActiveModes, "init", 0);
			}
			else
				future.result = { returnValue: false, errorText: "No current mode" };
		}
	}
	else {
		console.error("Reload mode called without name!");
		
		future.result = { returnValue: false, errorText: "No name given" };
	}
}

ExecuteCommandAssistant.prototype.executeUpdateMode = function(future, config, args) {
	if(args.names) {
		console.error("Executing mode update: " + JSON.stringify(args.names));
		
		var newActiveModes = [config.customModes[0]];
		
		var index = utils.findArray(config.customModes, "name", args.names[0]);
		
		if((index != -1) && (config.customModes[index].type == "normal"))
			newActiveModes[0] = config.customModes[index];
		
		for(var i = 1; i < args.names.length; i++) {
			var index = utils.findArray(config.customModes, "name", args.names[i]);
			
			if((index != -1) && (config.customModes[index].type == "modifier")) 
				newActiveModes.push(config.customModes[index]);
		}
		
		if(args.notify == false)
			var notify = 0;
		else {
			if(newActiveModes[0].notify != 0)
				var notify = newActiveModes[0].notify;
			else
				var notify = config.customModes[0].notify;
		}

		PalmCall.call("palm://com.palm.applicationManager/", "launch", {
			'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
			'notify': notify, 'name': "Current Mode", 'event': "update"}});
		
		this.prepareModeChange(future, config, newActiveModes, "init", 0);
	}
	else {
		console.error("Update mode called without names!");
		
		future.result = { returnValue: false, errorText: "No names given" };
	}
}

ExecuteCommandAssistant.prototype.executeTriggerMode = function(future, config, args) {
	if(args.name) {
		console.error("Executing triggering of: " + args.name);
		
		if((args.name == "Current Mode") && (config.activeModes.length > 0))
			args.name = config.activeModes[0].name;
		else if((args.name == "Previous Mode") && (config.historyList.length > 0))
			args.name = config.historyList[0].name;
		
		var index = utils.findArray(config.customModes, "name", args.name);
		
		if(index != -1) {
			if(utils.findArray(config.activeModes, "name", args.name) == -1)
			{
				if(this.checkModeTriggers(future, config, config.customModes[index]))
					this.executeStartMode(future, config, args.name);
				else
					future.result = { returnValue: true };
			}
			else {
				if(!this.checkModeTriggers(future, config, config.customModes[index]))
					this.executeCloseMode(future, config, args.name);
				else
					future.result = { returnValue: true };
			}
		}
		else
			future.result = { returnValue: false, errorText: "Mode not found" };
	}
	else {
		console.error("Trigger mode called without name!");
	
		future.result = { returnValue: false, errorText: "No name given" };
	}
}

//

ExecuteCommandAssistant.prototype.prepareModeChange = function(future, config, newActiveModes, roundPhase, roundCount) {  
	console.error("Executing mode updating: " + roundPhase + " " + roundCount);
	
	var lockedState = config.modeLocked;
	var modesChanged = false;
	
	var control = new Array();
	
	if(config.activeModes.length > 0)
		var oldActiveModes = config.activeModes;
	else
		var oldActiveModes = [];
	
	var modesA = [oldActiveModes, newActiveModes];
	var modesB = [newActiveModes, oldActiveModes];
	
	if(roundPhase == "init")
		var events = ["close", "start"];
	else
		var events = ["closed", "started"];
	
	for(var loop = 0; loop < 2; loop++) {
		control = new Array();
		
		for(var i = 0; i < modesA[loop].length; i++) {
			if((this.controller.args.startup) || (utils.findArray(modesB[loop], "name", modesA[loop][i].name) == -1)) {
				for(var j = 0; j < modesA[loop][i].actions.list.length; j++) {
					if(modesA[loop][i].actions.list[j].type == "ms") {
						// Should check for: reloading, starting, switching and closing.
						
						if(((modesA[loop][i].actions.list[j].event == events[loop]) && 
							((((events[loop] == "start") || (events[loop] == "started")) &&
							((this.controller.args.startup == true) || (newActiveModes[0].type != "default") ||
							(oldActiveModes.length == 0) || (oldActiveModes[0].type == "default"))) ||
							(((events[loop] == "close") || (events[loop] == "closed")) &&
							((newActiveModes[0].type == "default") || (modesA[loop][i].type == "modifier"))))) ||
							((modesA[loop][i].actions.list[j].event == "switch") && (roundPhase == "init")) ||
							((modesA[loop][i].actions.list[j].event == "switched") && (roundPhase == "done")))
						{
							if(modesA[loop][i].actions.list[j].action == "lock") {
								console.error("Mode lock action: " + this.lockedState + " true");
							
								lockedState = true;
							}
							else if(modesA[loop][i].actions.list[j].action == "unlock") {
								console.error("Mode unlock action: " + this.lockedState + " false");
							
								lockedState = false;
							}
							else
								control.push(modesA[loop][i].actions.list[j]);
						}
					}
				}
			}
		}
		
		for(var i = 0; i < control.length; i++) {
			var modeName = control[i].mode;
			
			if(modeName == "All Normal Modes") {
				if(control[i].action == "trigger") {
					for(var j = 0; j < config.customModes.length; j++) {
						if((config.customModes[j].type == "normal") && 
							(config.customModes[j].start != 0) &&
							(config.customModes[j].name != newActiveModes[0].name) &&
							(this.checkModeTriggers(future, config, config.customModes[j])))
						{
							console.error("Mode " + control[i].action + " action: " + config.customModes[j].name);
							
							modesChanged = true;
							
							newActiveModes.splice(0, 1, config.customModes[j]);
							
							break;
						}
					}
				}
			}
			else if(modeName == "All Modifier Modes") {
				if((control[i].action == "start") || (control[i].action == "trigger")) {
					for(var j = 0; j < config.customModes.length; j ++) {
						if((config.customModes[j].type == "modifier") &&
							(utils.findArray(newActiveModes, "name", config.customModes[j].name) == -1))
						{
							if((control[i].action == "start") || ((control[i].action == "trigger") &&
								(config.customModes[j].start != 0) &&
								(this.checkModeTriggers(future, config, config.customModes[j]))))
							{
								console.error("Mode " + control[i].action + " action: " + config.customModes[j].name);
								
								modesChanged = true;
								
								newActiveModes.push(config.customModes[j]);
							}
						}
					}
				}
				else if(control[i].action == "close") {
					if(newActiveModes.length > 1) {
						console.error("Mode " + control[i].action + " action: Modifier Modes");
						
						modesChanged = true;
						
						newActiveModes.splice(1, newActiveModes.length - 1);
					}
				}
			}
			else {
				if((modeName == "Current Mode") && (config.activeModes.length > 0))
					modeName = config.activeModes[0].name;
				else if((modeName == "Previous Mode") && (config.historyList.length > 0))
					modeName = config.historyList[0].name;
				
				var index = utils.findArray(config.customModes, "name", modeName);
				
				if((index != -1) && (index != 0)) {
					if((control[i].action == "start") || ((control[i].action == "trigger") &&
						(config.customModes[index].start != 0) && 
						(this.checkModeTriggers(future, config, config.customModes[index]))))
					{
						if(utils.findArray(newActiveModes, "name", modeName) == -1) {
							if(config.customModes[index].type == "normal") {
								console.error("Mode " + control[i].action + " action: " + config.customModes[index].name);
								
								modesChanged = true;
								
								newActiveModes.splice(0, 1, config.customModes[index]);
							}
							else if(config.customModes[index].type == "modifier") {
								console.error("Mode " + control[i].action + " action: " + config.customModes[index].name);	
								
								modesChanged = true;
								
								newActiveModes.push(config.customModes[index]);
							}
						}
					}
					else if(control[i].action == "close") {
						var index = utils.findArray(newActiveModes, "name", modeName);
						
						if(index != -1) {
							if(newActiveModes[index].type == "normal") {
								console.error("Mode " + control[i].action + " action: " + newActiveModes[index].name);
								
								modesChanged = true;
								
								newActiveModes.splice(0, 1, config.customModes[0]);
							}
							else if(newActiveModes[index].type == "modifier") {
								console.error("Mode " + control[i].action + " action: " + newActiveModes[index].name);
							
								modesChanged = true;
								
								newActiveModes.splice(index, 1);
							}
						}
					}
				}
			}
		}
	}
	
	if((modesChanged) && (roundCount < 5)) {
		this.prepareModeChange(future, config, newActiveModes, "init", ++roundCount);
	}
	else {
		if(roundCount == 5) {
			PalmCall.call("palm://com.palm.applicationManager/", "launch", {
				'id': "org.e.lnx.wee.modeswitcher", 'params': {'action': "notify", 
					'notify': 5, 'name': "Current Mode", 'event': "error"}});
		}
		
		if(roundPhase == "init") {
			this.executeModeChange(future, config, newActiveModes, "done", roundCount);
		}
		else if(roundPhase == "done") {
			var newHistoryList = this.updateHistoryList(future, config, newActiveModes[0]);
			
			future.nest(prefs.save({ modeLocked: lockedState, activeModes: newActiveModes, 
				historyList: newHistoryList}));
				
			future.then(this, function(future) { future.result = { returnValue: true }; });
		}
	}
}

ExecuteCommandAssistant.prototype.executeModeChange = function(future, config, newActiveModes, roundPhase, roundCount) {
	console.error("Executing mode updating: exec " + roundCount);
	
	this.executeSettingsUpdate(future, config, config.activeModes, newActiveModes, 
		function(future, config, newActiveModes, roundPhase, roundCount) {
			// When done updating the system settings then call apps update.
			
			this.executeActionsUpdate(future, config, config.activeModes, newActiveModes, 
				function(future, config, newActiveModes, roundPhase, roundCount) {
					// When done updating apps and srvs then call mode update.
					
					this.prepareModeChange(future, config, newActiveModes, roundPhase, roundCount);
				}.bind(this, future, config, newActiveModes, roundPhase, roundCount)
			);
		}.bind(this, future, config, newActiveModes, roundPhase, roundCount)
	);
}

//

ExecuteCommandAssistant.prototype.executeSettingsUpdate = function(future, config, oldActiveModes, newActiveModes, doneCallback) {
	console.error("Applying current system settings");
	
	future.nest(utils.futureLoop(config.extensions.settings, 
		function(item) {
			var future = new Future();
			
			var oldModeSettings = {'extension': item};
			var newModeSettings = {'extension': item};
			
			var modes = [config.customModes[0]].concat(newActiveModes);
			
			for(var j = 0; j < modes.length; j++) {
				var index = utils.findArray(modes[j].settings, "extension", item);
				
				if(index != -1)
					utils.extend(newModeSettings, modes[j].settings[index]);
			}
			
			if((oldActiveModes.length > 0) && 
				((!config.preferences.settings[item]) || 
				(!config.preferences.settings[item].force))) 
			{
				var modes = [config.customModes[0]].concat(oldActiveModes);
				
				for(var j = 0; j < modes.length; j++) {
					var index = utils.findArray(modes[j].settings, "extension", item);
					
					if(index != -1)
						utils.extend(oldModeSettings, modes[j].settings[index]);
				}
			}
			
			console.error("Applying system settings: " + item);
			
			eval("future.nest(" + item + "Settings.update(oldModeSettings, newModeSettings));");
			
			future.then(this, function(future) { future.result = { returnValue: true }; });

			return future;
		}.bind(this)));
	
	future.then(this, function(future) { doneCallback(); });
}

ExecuteCommandAssistant.prototype.executeActionsUpdate = function(future, config, oldActiveModes, newActiveModes, doneCallback) {
	console.error("Updating applications and services");
	
	var closeAppsSrvs = new Array();
	var startAppsSrvs = new Array();
	
	var oldCloseAllStartedApps = false;
	var newCloseAllStartedApps = false;
	
	for(var i = 0; i < newActiveModes.length; i++) {
		if((newActiveModes[i].type != "default") || (newActiveModes[i].start == 0) ||
			(this.controller.args.startup))
		{
			if((utils.findArray(oldActiveModes, "name", newActiveModes[i].name) == -1) ||
				(this.controller.args.startup))
			{
				if(newActiveModes[i].actions.start == 2)
					newCloseAllStartedApps = true;
				
				for(var j = 0; j < newActiveModes[i].actions.list.length; j++) {
					if(newActiveModes[i].actions.list[j].type == "ms")
						continue;
					
					if(config.extensions.actions.indexOf(newActiveModes[i].actions.list[j].extension) == -1)
						continue;
					
					if((this.controller.args.startup) && (newActiveModes[i].actions.list[j].extension == "systools"))
						continue;
					
					if((newActiveModes[i].actions.list[j].event == "start") ||
						(newActiveModes[i].actions.list[j].event == "both"))
					{
						startAppsSrvs.push(newActiveModes[i].actions.list[j]);
					}
				}
			}
		}
	}

	if(oldActiveModes) {
		for(var i = 0; i < oldActiveModes.length; i++) {
			if((utils.findArray(newActiveModes, "name", oldActiveModes[i].name) == -1))
			{
				if(oldActiveModes[i].actions.close == 2)
					oldCloseAllStartedApps = true;
				
				for(var j = 0; j < oldActiveModes[i].actions.list.length; j++) {
					if(oldActiveModes[i].actions.list[j].type == "ms")
						continue;
					
					if(config.extensions.actions.indexOf(oldActiveModes[i].actions.list[j].extension) == -1)
						continue;
					
					if((this.controller.args.startup) && (newActiveModes[i].actions.list[j].extension == "systools"))
						continue;
					
					if((oldActiveModes[i].actions.list[j].event == "start") ||
						(oldActiveModes[i].actions.list[j].event == "both"))
					{
						if((oldActiveModes[i].actions.list[j].type == "app") &&
							(oldActiveModes[i].actions.close == 1))
						{
							closeAppsSrvs.push(oldActiveModes[i].actions.list[j]);
						}
					}
					
					if((oldActiveModes[i].actions.list[j].event == "close") ||
						(oldActiveModes[i].actions.list[j].event == "both"))
					{
						if((oldActiveModes[i].actions.list[j].type == "app") && 
							(!newCloseAllStartedApps)) 
						{
							startAppsSrvs.push(oldActiveModes[i].actions.list[j]);
						}
						else if(oldActiveModes[i].actions.list[j].type == "srv")
						{
							closeAppsSrvs.push(oldActiveModes[i].actions.list[j]);
						}
					}
				}
			}
		}
	}
	
	if((oldCloseAllStartedApps) || (newCloseAllStartedApps))
		closeAppsSrvs = "all";
	
	future.nest(apps.update(closeAppsSrvs, startAppsSrvs));
	
	future.then(this, function(future) { doneCallback(); });
}

//

ExecuteCommandAssistant.prototype.updateHistoryList = function(future, config, newActiveMode) {
	console.error("Updating mode history list config");
	
	// Add to list if this is a new mode if already last in the list then remove.
	
	if(config.activeModes.length > 0) {
		if((config.activeModes[0].type != "default") && 
			(config.activeModes[0].name != newActiveMode.name))
		{
			if(config.historyList.length == 0) {
				config.historyList.push({'name': config.activeModes[0].name});
			}
			else {
				config.historyList.unshift({'name': config.activeModes[0].name});
				
				if(config.historyList.length > 10)
					config.historyList.splice(10, 1);
			}
		}
		else if((config.historyList.length > 0) && 
			(config.historyList[0].name == newActiveMode.name))
		{
				config.historyList.shift();
		}
	}
	
	return config.historyList;
}

//

ExecuteCommandAssistant.prototype.checkModeTriggers = function(future, config, mode) {
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
