/*
	Messaging Configuration Object:
	
	accounts: 				{
		'accountId':			{
			databaseId:				string,
			serviceName:			string,
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
	availability:			{
		'accountId':			integer
								}
*/	

var messagingSettings = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var Future = Foundations.Control.Future;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
//
	
	var fetchAccounts = function(settingsOld, settingsNew) {
		var future = new Future();
		
		if(settingsNew.accounts) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.messaging", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.imloginstate:1"}}}));
			
			future.then(this, function(future) { 
				var results = future.result.results;
				
				for(var accId in settingsNew.accounts) {
					if((accId != "sms") && 
						(utils.findArray(results, "accountId", accId) == -1))
					{
						delete settingsNew.accounts[accId];
					}
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
			
			var notifParams = {};
			
			for(var accId in settingsNew.accounts) {
				var sName = settingsNew.accounts[accId].serviceName;
				
				if(accId == "sms") {
					notifParams._id = settingsNew.accounts[accId].databaseId;
					
					if((settingsNew.blinkNotify[accId] != undefined) && ((!settingsOld.blinkNotify) || 
						(settingsOld.blinkNotify[accId] != settingsNew.blinkNotify[accId])))
					{
						notifParams.blinkNotification = settingsNew.blinkNotify[accId];
					}
					
					if((settingsNew.notifyAlert[accId] != undefined) && ((!settingsOld.notifyAlert) || 
						(settingsOld.notifyAlert[accId] != settingsNew.notifyAlert[accId])))
					{
						notifParams.notificationSound = settingsNew.notifyAlert[accId];
					}
					
					if((settingsNew.ringtonePath[accId] != undefined) && ((!settingsOld.ringtonePath) || 
						(settingsOld.ringtonePath[accId] != settingsNew.ringtonePath[accId])))
					{
						notifParams.ringtone = {
							name: settingsNew.ringtoneName[accId],
							path: settingsNew.ringtonePath[accId] };
					}
				}
				else {
					if((settingsNew.blinkNotify[accId] != undefined) && ((!settingsOld.blinkNotify) || 
						(settingsOld.blinkNotify[accId] != settingsNew.blinkNotify[accId])))
					{
						if(!notifParams.accountNotifications)
							notifParams.accountNotifications = {};
						
						if(!notifParams.accountNotifications[sName])
							notifParams.accountNotifications[sName] = {};
						
						notifParams.accountNotifications[sName].blinkNotification = settingsNew.blinkNotify[accId];
					}
					
					if((settingsNew.notifyAlert[accId] != undefined) && ((!settingsOld.notifyAlert) || 
						(settingsOld.notifyAlert[accId] != settingsNew.notifyAlert[accId])))
					{
						if(!notifParams.accountNotifications)
							notifParams.accountNotifications = {};
						
						if(!notifParams.accountNotifications[sName])
							notifParams.accountNotifications[sName] = {};
						
						notifParams.accountNotifications[sName].notificationSound = settingsNew.notifyAlert[accId];
					}
					
					if((settingsNew.ringtonePath[accId] != undefined) && ((!settingsOld.ringtonePath) || 
						(settingsOld.ringtonePath[accId] != settingsNew.ringtonePath[accId])))
					{
						if(!notifParams.accountNotifications)
							notifParams.accountNotifications = {};
						
						if(!notifParams.accountNotifications[sName])
							notifParams.accountNotifications[sName] = {};
						
						notifParams.accountNotifications[sName].ringtone = {
							name: settingsNew.ringtoneName[accId],
							path: settingsNew.ringtonePath[accId] };
					}
					
					var params = {_id: settingsNew.accounts[accId].databaseId};
					
					if((settingsNew.availability[accId] != undefined) && ((!settingsOld.availability) || 
						(settingsOld.availability[accId] != settingsNew.availability[accId])))
					{
						params.availability = parseInt(settingsNew.availability[accId]);
					}
					
					if(params.availability != undefined) {
						objects.push(params);
					}
				}
			}
			
			if((notifParams.blinkNotification != undefined) || (notifParams.notificationSound != undefined) || 
				(notifParams.ringtone != undefined) || (notifParams.accountNotifications != undefined))
			{
				objects.push(notifParams);
			}
			
			if(objects.length > 0) {
				future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
					'id': "com.palm.app.messaging", 'service': "com.palm.db", 
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
