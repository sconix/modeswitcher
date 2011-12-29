/*
	Email Configuration Object:
	
	accounts: 				{
		'accountId':			{
			isDefault:				boolean,
			databaseId:				string,
			identifier:				string 
									}
								},
	blinkNotify:			{
		'accountId':			boolean
								},
	notifyAlert:			{
		'accountId':			string
								},
	ringtoneName: 			{
		'accountId':			string
								},
	ringtonePath: 			{
		'accountId':			string
								},
	syncInterval:			{
		'accountId':			integer
								}
*/

var emailSettings = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var Future = Foundations.Control.Future;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
//
	
	var fetchAccounts = function(settingsOld, settingsNew) {
		var future = new Future();
		
		if(settingsNew.accounts) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.email", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.mail.account:1"}}}));
			
			future.then(this, function(future) { 
				var results = future.result.results;
				
				for(var accId in settingsNew.accounts) {
					if(utils.findArray(results, "accountId", accId) == -1)
						delete settingsNew.accounts[accId];
				}
				
				future.result = true;
			});
		}
		else
			future.result = true;
		
		return future;
	};
	
	var updateSettings = function(settingsOld, settingsNew) {
		var future = new Future();
		
		if(settingsNew.accounts) {
			var objects = [];
			
			for(var accId in settingsNew.accounts) {
				var params  = {_id: settingsNew.accounts[accId].databaseId, notifications: {}};
				
				if((settingsNew.blinkNotify[accId] != undefined) && ((!settingsOld.blinkNotify) || 
					(settingsOld.blinkNotify[accId] != settingsNew.blinkNotify[accId])))
				{
					params.notifications.blink = settingsNew.blinkNotify[accId];
				}
				
				if((settingsNew.notifyAlert[accId] != undefined) && ((!settingsOld.notifyAlert) || 
					(settingsOld.notifyAlert[accId] != settingsNew.notifyAlert[accId])))
				{
					params.notifications.type = settingsNew.notifyAlert[accId];
				}
				
				if((settingsNew.ringtonePath[accId] != undefined) && ((!settingsOld.ringtonePath) || 
					(settingsOld.ringtonePath[accId] != settingsNew.ringtonePath[accId])))
				{
					params.notifications.ringtoneName = settingsNew.ringtoneName[accId];
					params.notifications.ringtonePath = settingsNew.ringtonePath[accId];
				}
				
				if((settingsNew.syncInterval[accId] != undefined) && ((!settingsOld.syncInterval) || 
					(settingsOld.syncInterval[accId] != settingsNew.syncInterval[accId])))
				{
					params.syncFrequencyMins = parseInt(settingsNew.syncInterval[accId]);
				}
				
				if((params.notifications.blink != undefined) || (params.notifications.type != undefined) || 
					(params.notifications.ringtonePath != undefined) || (params.syncFrequencyMins != undefined))
				{
					objects.push(params);
				}
			}
			
			if(objects.length > 0) {
				future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
					'id': "com.palm.app.email", 'service': "com.palm.db", 
					'method': "merge", 'params': {'objects': objects}}));
				
				future.then(this, function(future) { future.result = true; });
			}
			else
				future.result = true;
		}
		else
			future.result = true;
		
		return future;
	};
	
//
	
	that.update = function(settingsOld, settingsNew) {
		var future = new Future();
		
		future.nest(fetchAccounts(settingsOld, settingsNew));
		
		future.then(this, function(future) {
			future.nest(updateSettings(settingsOld, settingsNew));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		});
		
		return future;
	};
	
	return that;
}());
