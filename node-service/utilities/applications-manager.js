var apps = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var executeUpdate = function(closeApps, startApps, doneCallback) {
		// First handle close and start operations for services.
		
		for(var i = 0; i < closeApps.length; i++) {
			if(closeApps[i].type == "srv") {
				var closeSrv = closeApps.splice(i--, 1)[0];
				
				if(closeSrv.method.close != undefined)
					var method = closeSrv.method.close;
				else
					var method = closeSrv.method;
				
				if(closeSrv.params.close != undefined)
					var params = closeSrv.params.close;
				else
					var params = closeSrv.params;
				
				try {eval("var parameters = " + params);} catch(error) {var parameters = {};}
				
				console.error("Executing service closing: " + closeSrv.name + " " + method + " " + JSON.stringify(parameters));
				
				PalmCall.call(closeSrv.url, method, parameters);
			}
		}
		
		for(var i = 0; i < startApps.length; i++) {
			if(startApps[i].type == "srv") {
				var startSrv = startApps.splice(i--, 1)[0];
				
				if(startSrv.method.start != undefined)
					var method = startSrv.method.start;
				else
					var method = startSrv.method;
				
				if(startSrv.params.start != undefined)
					var params = startSrv.params.start;
				else
					var params = startSrv.params;
				
				try {eval("var parameters = " + params);} catch(error) {var parameters = {};}
				
				console.error("Executing service starting: " + startSrv.name + " " + method + " " + JSON.stringify(parameters));
				
				PalmCall.call(startSrv.url, method, parameters);
			}
		}
		
		// Then handle the closing and starting normal applications.
		
		var future = PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.applicationManager", 'service': "com.palm.applicationManager", 
				'method': "running", 'params': {}});
		
		future.then(this, function(future) {
			var runningApps = future.result.running;
			
			if(closeApps == "all")
				closeApps = runningApps;
			
			runningApps.reverse();
			
			// Remove apps that would have been closed and started right after.
			
			for(var i = 0; i < closeApps.length; i++) {
				if(closeApps[i].processid == undefined) {
					for(var j = 0; j < startApps.length; j++) {
						if((closeApps[i].appid == startApps[j].appid) &&
							(closeApps[i].params == startApps[j].params))
						{
							closeApps.splice(i--, 1);
							startApps.splice(j--, 1);
							
							break;
						}
					}
				}
			}
			
			// Close the app if it is not set to be started and is started by MS.
			
			for(var i = 0; i < closeApps.length; i++) {
				var appid = null;
				var processid = 0;
				
				if(closeApps[i].processid == undefined) {
					/*for(var j = 0; j < config.startedApps.length; j++) {
						if((config.startedApps[j].appid == closeApps[i].appid) &&
							(config.startedApps[j].params == closeApps[i].params))
						{
							for(var k = 0; k < runningApps.length; k++) {
								if(((config.startedApps[j].processid < 1010) &&
									(runningApps[k].id == config.startedApps[j].appid)) ||
									((runningApps[k].processid == config.startedApps[j].processid) &&
									(runningApps[k].id == config.startedApps[j].appid)))
								{
									appid = runningApps[k].id;
									processid = runningApps[k].processid;
									
									break;
								}
							}
							
							config.startedApps.splice(j--, 1);
						}
					}*/
					
					for(var k = 0; k < runningApps.length; k++) {
						if((runningApps[k].processid > 1010) &&
							(runningApps[k].id == closeApps[i].appid))
						{
							appid = runningApps[k].id;
							processid = runningApps[k].processid;
							
							if((appid) && (processid))
								executeClose(appid, processid);
						}
					}
				}
				else {
					appid = closeApps[i].id;
					processid = closeApps[i].processid;
					
					if((appid) && (processid))
						executeClose(appid, processid);
				}
			}
			
			// Start requested apps and collect and save the processid information.
			
			for(var i = 0; i < startApps.length; i++)
				this.setTimeout(executeLaunch.bind(this, startApps[i]), 500 * (i+1));
			
			future.result = { returnValue: true };
		}); 
		
		return future;
	};
	
	var executeLaunch = function(item) {
		console.error("Launching application: " + item.appid);
		
		try {eval("var parameters = " + item.params);} catch(error) {var parameters = "";}
		
		PalmCall.call("palm://com.palm.applicationManager/", "launch", {'id': item.appid, 'params': parameters});
	};
	
	var executeClose = function(appId, processId) {
		if((processId > 1010) && (appId != "com.palm.systemui") && (appId != "com.palm.app.phone") &&
			(appId != "org.e.lnx.wee.modeswitcher"))
		{
			console.error("Closing application: " + appId + " " + processId);
			
			PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.applicationManager", 'service': "com.palm.applicationManager", 
				'method': "close", 'params': {'processId': processId}});
			
			PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.applicationManager", 'service': "com.palm.applicationManager", 
				'method': "close", 'params': {'processId': processId}});
		}
	};
	
//
	
	that.update = function(closeApps, startApps) {
		if(closeApps == "all")
			console.error("Updating running applications: * " + startApps.length);
		else
			console.error("Updating running applications: " + closeApps.length + " " + startApps.length);
		
		return executeUpdate(closeApps, startApps);
	};
	
	return that;
}());
