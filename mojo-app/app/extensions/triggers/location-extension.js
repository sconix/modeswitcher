function LocationTriggers(controller) {
	this.controller = controller;
}

//

LocationTriggers.prototype.basic = function() {
	return true;
}

//

LocationTriggers.prototype.label = function() {
	return $L("GPS Location Trigger");
}

//

LocationTriggers.prototype.setup = function(controller) {
	this.controller = controller;

	this.choicesActiveSelector = [
		{'label': $L("When In Location"), 'value': 0},
		{'label': $L("When Not In Location"), 'value': 1}];  

	this.controller.setupWidget("LocationActiveSelector", {'label': $L("Active"), 
		'labelPlacement': "left", 'modelProperty': "locationActive",
		'choices': this.choicesActiveSelector});

	this.choicesLocationSelector = [
		{'label': $L("Select New Location"), 'value': "select"},
		{'label': $L("Get Current Location"), 'value': "current"}];  

	this.controller.setupWidget("LocationLocationSelector", {'label': $L("Location"), 
		'labelPlacement': "left", 'modelProperty': "locationLocation", 
		'disabledProperty': "locationDisabled",
		'choices': this.choicesLocationSelector});

	this.choicesRadiusSelector = [
		{'label': "100 " + $L("Meters"), 'value': 100},
		{'label': "250 " + $L("Meters"), 'value': 250},
		{'label': "500 " + $L("Meters"), 'value': 500},
		{'label': "1000 " + $L("Meters"), 'value': 1000},
		{'label': "1500 " + $L("Meters"), 'value': 1500},
		{'label': "2000 " + $L("Meters"), 'value': 2000}];  

	this.controller.setupWidget("LocationRadiusSelector", {'label': $L("Radius"), 
		'labelPlacement': "left", 'modelProperty': "locationRadius",
		'choices': this.choicesRadiusSelector});

	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.listTap, 
		this.helpItemTapped.bind(this));
		
	// Listen for change event for location selector
	
	this.controller.listen(this.controller.get("TriggersList"), Mojo.Event.propertyChange, 
		this.handleListChange.bind(this));
}

//

LocationTriggers.prototype.config = function() {
	var config = {
		'locationTitle': $L("GPS Location"),
		'locationDisabled': false,
		'locationActive': 0,
		'locationLocation': $L("No Location Set"),
		'locationRadius': 250,
		'locationLatitude': -1,
		'locationLongitude': -1 };

	return config;
}

//

LocationTriggers.prototype.load = function(extensionPreferences) {
	var latitude = -1;
	var longitude = -1;

	var location = $L("No Location Set");

	if(extensionPreferences.latitude != undefined)
		latitude = extensionPreferences.latitude;

	if(extensionPreferences.longitude != undefined)
		longitude = extensionPreferences.longitude;
		
	if((latitude != -1) && (longitude != -1)) {
		location = (Math.round(latitude*1000)/1000).toFixed(3) + 
			" ; " + (Math.round(longitude*1000)/1000).toFixed(3);
	}

	var extensionConfig = {
		'locationTitle': $L("GPS Location"),
		'locationDisabled': false,
		'locationActive': extensionPreferences.active,		
		'locationLatitude': latitude,
		'locationLongitude': longitude,
		'locationLocation':  location,
		'locationRadius': extensionPreferences.radius};
	
	return extensionConfig;
}

LocationTriggers.prototype.save = function(extensionConfig) {
	var latitude = -1;
	var longitude = -1;

	if((extensionConfig.locationLocation != $L("No Location Set")) ||
		(extensionConfig.locationLocation != $L("Failed to Locate")) ||
		(extensionConfig.locationLocation != $L("Querying Location")))
	{
		latitude = extensionConfig.locationLatitude;
		longitude = extensionConfig.locationLongitude;
	}
		
	var extensionPreferences = {
		'active': extensionConfig.locationActive,
		'latitude': latitude,
		'longitude': longitude,
		'radius': extensionConfig.locationRadius };
	
	return extensionPreferences;
}

//

LocationTriggers.prototype.helpItemTapped = function(event) {
	if(event.originalEvent.target.id == "LocationActiveHelp") {
		var helpTitle = "Active";

		var helpText = "Determines when mode should be active, when in or out of the location.";
	}
	else if(event.originalEvent.target.id == "LocationLocationHelp") {
		var helpTitle = "Location";

		var helpText = "Coordinates for the location limitation.";
	}
	else if(event.originalEvent.target.id == "LocationRadiusHelp") {
		var helpTitle = "Radius";

		var helpText = "Radius for the location coordinates.";
	}
	else
		return;
	
	this.controller.showAlertDialog({
		title: helpTitle,
		message: "<div style='text-align:justify;'>" + helpText + "</div>",
		choices:[{"label": "Close", "command": "close"}],
		preventCancel: false,
		allowHTMLMessage: true
	});
}

//

LocationTriggers.prototype.handleListChange = function(event) {
	if(event.property == "locationLocation") {
		if(event.value == "select") {
			var coords = null;

			event.model.locationLocation = $L("No Location Set");

			if((event.model.locationLatitude != -1) && (event.model.locationLongitude != -1)) {
				var mapdata = {lat: event.model.locationLatitude, lng: event.model.locationLongitude};
				
				event.model.locationLocation = (Math.round(event.model.locationLatitude*1000)/1000).toFixed(3) + 
					" ; " + (Math.round(event.model.locationLongitude*1000)/1000).toFixed(3);
			}

			this.controller.modelChanged(event.model, this);
			
			this.controller.stageController.pushScene("gdm", "pickLocation", "Location", event.model.locationRadius, 
				mapdata, this.handleLocationSelect.bind(this, event.model));
		}
		else if(event.value == "current") {
			event.model.locationLocation = $L("Querying Location");

			event.model.locationDisabled = true;

			this.controller.modelChanged(event.model, this);			

			this.fetchCurrentLocation(event.model, 0);
		}
	}
}

LocationTriggers.prototype.handleLocationSelect = function(model, latitude, longitude, returnValue) {
	if(returnValue) {
		model.locationLocation = (Math.round(latitude*1000)/1000).toFixed(3) + 
			" ; " + (Math.round(longitude*1000)/1000).toFixed(3);
		
		model.locationLatitude = latitude;
		model.locationLongitude = longitude;
		
		this.controller.modelChanged(model, this);					
	}
}

//

LocationTriggers.prototype.fetchCurrentLocation = function(model, retry) {
	Mojo.Log.error("Fetching current location: " + retry);

	if(retry < 20) {
		this.controller.serviceRequest("palm://com.palm.location/", {
			'method': "getCurrentPosition", 'parameters': {'Accuracy': 1},
			'onSuccess': this.handleCurrentLocation.bind(this, model, retry),
			'onFailure': this.fetchCurrentLocation.bind(this, model, ++retry)});
	}
	else {
		model.locationLocation = $L("Failed to Locate");
	
		model.locationLatitude = -1;
		model.locationLongitude = -1;
		
		model.locationDisabled = false;
		
		this.controller.modelChanged(model, this);
	}
}

LocationTriggers.prototype.handleCurrentLocation = function(model, retry, response) {
	if((response.horizAccuracy == -1) || (response.horizAccuracy > 100)) {	
		Mojo.Log.error("Insufficient location accuracy: " + response.horizAccuracy);

		this.fetchCurrentLocation(model, ++retry);
	}
	else {
		model.locationDisabled = false;
	
		model.locationLocation = (Math.round(response.latitude*1000)/1000).toFixed(3) + 
			" ; " + (Math.round(response.longitude*1000)/1000).toFixed(3);
	
		model.locationLatitude = Math.round(response.latitude*1000000)/1000000;
		model.locationLongitude = Math.round(response.longitude*1000000)/1000000;
			
		this.controller.modelChanged(model, this);
	}
}

