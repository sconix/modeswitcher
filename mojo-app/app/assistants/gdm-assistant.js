function GdmAssistant(action, item, filter, data, callback) {
	this.action = action;

	this.item = item;
	
	this.filter = filter;

	this.data = data;

	this.callback = callback;

	this.viewLevel = 0;
}

//

GdmAssistant.prototype.setup = function() {
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		{visible: true, items: [{label: $L("Help"), command: 'help'}]});

	if(this.action == "importGDoc") {
		this.controller.get('import').show();

		this.controller.get('ImportTitle1').update("Import " + this.item);
		this.controller.get('ImportTitle2').update("Import " + this.item);
	}		
	else if(this.action == "exportGDoc") {
		this.controller.get('export').show();

		this.controller.get('ExportTitle').update("Export " + this.item);
	}
	else if(this.action == "pickLocation")
		this.controller.get('mapview').show();
		
	// IMPORT
	
	this.modelImportGDMatch = {value: "", disabled: false};
	
	this.controller.setupWidget("ImportGDMatch", {'hintText': $L("Match words..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true},
		this.modelImportGDMatch); 

	this.modelImportGDShare = {value: false, disabled: false};

	this.controller.setupWidget("ImportGDShared", {'trueLabel': $L("Yes"), 'falseLabel': $L("No")},
		this.modelImportGDShare); 

	this.handlerSharedToggled = this.toggleSharedOptions.bindAsEventListener(this);

	this.controller.listen(this.controller.get("ImportGDShared"), Mojo.Event.propertyChange, 
		this.handlerSharedToggled);

	this.modelImportGDOrdering = {'value': "title", 'disabled': false};
	
	this.defaultChoicesImportGDOrdering = [
		{'label': $L("Title"), 'value': "title"},
		{'label': $L("Last Modified"), 'value': "last-modified"}];  
		
	this.controller.setupWidget("ImportGDOrdering", {'label': $L("Order by"), 
		'labelPlacement': "left", 'choices': this.defaultChoicesImportGDOrdering}, 
		this.modelImportGDOrdering);

	var cookie = new Mojo.Model.Cookie('googledocs');

	var userinfo = cookie.get();

	if((userinfo) && (userinfo.username))
		this.modelImportGDUsername = {value: userinfo.username, disabled: false};
	else
		this.modelImportGDUsername = {value: "", disabled: false};
				
	this.controller.setupWidget("ImportGDUsername", {'hintText': $L("Google Docs email..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 'textCase': Mojo.Widget.steModeLowerCase},
		this.modelImportGDUsername); 

	this.modelImportGDPassword = {value: "", disabled: false};
	
	this.controller.setupWidget("ImportGDPassword", {'hintText': $L("Google Docs password..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 'textCase': Mojo.Widget.steModeLowerCase},
		this.modelImportGDPassword); 

	this.modelImportGDLimit = {'value': 100, 'disabled': false};
	
	this.defaultChoicesImportGDLimit = [
		{'label': $L("50 Latest"), 'value': 50},
		{'label': $L("100 Latest"), 'value': 100},
		{'label': $L("500 Latest"), 'value': 500}];  
		
	this.controller.setupWidget("ImportGDLimit", {'label': $L("Fetch Limit"), 
		'labelPlacement': "left", 'choices': this.defaultChoicesImportGDLimit}, 
		this.modelImportGDLimit);

	this.modelImportGDManual = {value: "", disabled: false};
	
	this.controller.setupWidget("ImportGDManual", {'hintText': $L("Direct entry url..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true, 'changeOnKeyPress': true},
		this.modelImportGDManual); 

	this.handlerManualChange = this.manualInputChange.bindAsEventListener(this);

	this.controller.listen(this.controller.get("ImportGDManual"), Mojo.Event.propertyChange, 
		this.handlerManualChange);

	this.modelImportGDList = {'items': []};

	this.controller.setupWidget("ImportGDList", {
		'itemTemplate': 'templates/gdocs-item',
		'swipeToDelete': false, 'reorderable': false,
		'autoconfirmDelete': true},
		this.modelImportGDList);
	
	this.handlerImportModeData = this.importDocumentData.bindAsEventListener(this);
	
	this.controller.listen(this.controller.get("ImportGDList"), Mojo.Event.listTap, 
		this.handlerImportModeData);

	this.modelImportGDButton = {buttonClass: '', disabled: false, label: $L("List " + this.item)};

	this.controller.setupWidget('ImportGDButton', {}, this.modelImportGDButton);
	
	this.controller.listen(this.controller.get('ImportGDButton'), Mojo.Event.tap, 
		this.listGoogleDocuments.bind(this));
			
	// EXPORT
	
	if((this.data) && (this.data.title))
		this.modelExportGDTitle = {value: this.data.title, disabled: false};
	else
		this.modelExportGDTitle = {value: "", disabled: false};
			
	this.controller.setupWidget("ExportGDTitle", {'hintText': $L("Descriptive document name..."), 
		'multiline': false, 'enterSubmits': false, 'focus': true},
		this.modelExportGDTitle); 

	this.modelExportGDDesc = {value: "", disabled: false};
	
	this.controller.setupWidget("ExportGDDesc", {'hintText': $L("Short document description..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false},
		this.modelExportGDDesc); 

	var cookie = new Mojo.Model.Cookie('googledocs');

	var userinfo = cookie.get();

	if((userinfo) && (userinfo.username))
		this.modelExportGDUsername = {value: userinfo.username, disabled: false};
	else
		this.modelExportGDUsername = {value: "", disabled: false};
	
	this.controller.setupWidget("ExportGDUsername", {'hintText': $L("Google Docs email..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 'textCase': Mojo.Widget.steModeLowerCase},
		this.modelExportGDUsername); 

	this.modelExportGDPassword = {value: "", disabled: false};
	
	this.controller.setupWidget("ExportGDPassword", {'hintText': $L("Google Docs password..."), 
		'multiline': false, 'enterSubmits': false, 'focus': false, 'textCase': Mojo.Widget.steModeLowerCase},
		this.modelExportGDPassword); 

	this.modelExportGDShare = {value: false, disabled: false};

	this.controller.setupWidget("ExportGDShare", {'trueLabel': $L("Yes"), 'falseLabel': $L("No")},
		this.modelExportGDShare); 
			
	this.modelExportGDButton = {buttonClass: '', disabled: false};

	this.controller.setupWidget('ExportGDButton', {label: $L("Export ") + this.item}, this.modelExportGDButton);
	
	this.controller.listen(this.controller.get('ExportGDButton'), Mojo.Event.tap, 
		this.exportDocumentData.bind(this)); 

	// MAP VIEW
	
	this.modelMapViewAddress = {value: "", disabled: false};
		
	this.controller.setupWidget("MapViewAddress", {'hintText': $L("Enter street address..."), 
		'multiline': false, 'enterSubmits': false, 'requiresEnterKey': true, 'focus': true},
		this.modelMapViewAddress); 

	this.controller.listen(this.controller.get('MapViewAddress'), Mojo.Event.propertyChange, 
		this.updateMapLocation.bind(this));

	if(this.action == "pickLocation") {
		Mojo.loadScriptWithCallback("http://maps.google.com/maps/api/js?sensor=false&callback=googleMapsLoaded", null);

		this.itemsCommandMenu = [
			{'label': "- " + $L("Zoom"), 'command': "zoom_out"},
			{'width': 5},
			{'label': $L("Done"), 'command': "done", 'width': 100},
			{'width': 5},
			{'label': $L("Zoom") + " +", 'command': "zoom_in"} ];
	
		this.modelCommandMenu = {'visible': true, 'items': this.itemsCommandMenu};
		
		this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.modelCommandMenu);
	}

	Mojo.Event.listen(this.controller.get("ImportMatchHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportMatchHelp"));

	Mojo.Event.listen(this.controller.get("ImportSharedHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportSharedHelp"));

	Mojo.Event.listen(this.controller.get("ImportOrderingHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportOrderingHelp"));				

	Mojo.Event.listen(this.controller.get("ImportUsernameHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportUsernameHelp"));
	
	Mojo.Event.listen(this.controller.get("ImportPasswordHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportPasswordHelp"));

	Mojo.Event.listen(this.controller.get("ImportLimitHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportLimitHelp"));

	Mojo.Event.listen(this.controller.get("ImportManualHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportManualHelp"));

	Mojo.Event.listen(this.controller.get("ExportTitleHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ExportTitleHelp"));

	Mojo.Event.listen(this.controller.get("ExportDescHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ExportDescHelp"));

	Mojo.Event.listen(this.controller.get("ExportUsernameHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportUsernameHelp"));

	Mojo.Event.listen(this.controller.get("ExportPasswordHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ImportPasswordHelp"));

	Mojo.Event.listen(this.controller.get("ExportShareHelp"), Mojo.Event.tap, 
		this.helpItemTapped.bind(this, "ExportShareHelp"));
	
	this.controller.listen(this.controller.get('help-toggle-import'), Mojo.Event.tap, this.helpButtonTapped.bindAsEventListener(this));
	this.controller.listen(this.controller.get('help-toggle-export'), Mojo.Event.tap, this.helpButtonTapped.bindAsEventListener(this));

	this.modelWaitSpinner = { spinning: false };

	this.controller.setupWidget('waitSpinner', {spinnerSize: Mojo.Widget.spinnerLarge}, this.modelWaitSpinner);
}

//

GdmAssistant.prototype.helpButtonTapped = function(event) {
	if(this.action == "importGDoc")
		var view = "import";
	else
		var view = "export";

	if(this.controller.get(view).hasClassName('help')) {
		this.controller.get(view).removeClassName('help');
		event.target.removeClassName('selected');
	}
	else {
		this.controller.get(view).addClassName('help');
		event.target.addClassName('selected');
	}
}

GdmAssistant.prototype.helpItemTapped = function(target) {
	if(target == "ImportMatchHelp") {
		var helpTitle = "Match Words";

		var helpText = "Space separated words list to match the document title to.";
	}
	else if(target == "ImportSharedHelp") {
		var helpTitle = "Only Show Shared";

		var helpText = "Determines if only shared documents be shown on the document list. Shared documents are listed from MS group instead of google docs.";
	}
	else if(target == "ImportOrderingHelp") {
		var helpTitle = "Order By";

		var helpText = "Determines how the document list should be ordered.";
	}
	else if(target == "ImportUsernameHelp") {
		var helpTitle = "Google Docs Username";

		var helpText = "Your google docs username.";
	}
	else if(target == "ImportPasswordHelp") {
		var helpTitle = "Google Docs Password";

		var helpText = "Your google docs password.";
	}
	else if(target == "ImportLimitHelp") {
		var helpTitle = "Fetch Limit";

		var helpText = "Limitation for how many documents to retrieve.";
	}
	else if(target == "ImportManualHelp") {
		var helpTitle = "Direct Entry Url";

		var helpText = "Direct url to shared google document to list.";
	}
	else if(target == "ExportTitleHelp") {
		var helpTitle = "Document Title";

		var helpText = "Title for the document.";
	}
	else if(target == "ExportDescHelp") {
		var helpTitle = "Document Description";

		var helpText = "Description for the document.";
	}
	else if(target == "ExportShareHelp") {
		var helpTitle = "Share With Group";

		var helpText = "Determines if the document should be private or shared. When shared the document will be viewable by everyone. To complete the sharing for the group you need to send the email which will be opened for you automatically.";
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

GdmAssistant.prototype.manualInputChange = function(event) {
	if(this.modelImportGDManual.value != "")
		this.modelImportGDButton.label = $L("Import " + this.item);
	else
		this.modelImportGDButton.label = $L("List " + this.item);

	this.controller.modelChanged(this.modelImportGDButton, this);
}

GdmAssistant.prototype.toggleSharedOptions = function(event) {
	if(event.value == true) {
		this.controller.get("privateDocs").hide();
		this.controller.get("publicDocs").show();
	}
	else {
		this.controller.get("publicDocs").hide();
		this.controller.get("privateDocs").show();
	}
}

//

GdmAssistant.prototype.listGoogleDocuments = function(event) {
	this.modelImportGDButton.disabled = true;

	this.controller.modelChanged(this.modelImportGDButton, this);

	this.controller.get("overlay-scrim").show();

	this.modelWaitSpinner.spinning = true;
	
	this.controller.modelChanged(this.modelWaitSpinner, this);

	if(this.modelImportGDShare.value)
		this.listGoogleShared(event);
	else
		this.listGooglePrivate(event);
}

GdmAssistant.prototype.listGoogleShared = function(event) {
	var limit = this.modelImportGDLimit.value;
	
	if(this.modelImportGDManual.value != "") {
		this.modelImportGDButton.disabled = false;

		this.controller.modelChanged(this.modelImportGDButton, this);

		var url = this.modelImportGDManual.value.replace("document/d/", "feeds/download/documents/Export?docID=").replace("/edit?hl=en", "");

		this.importDocumentData({item: {value: url}});
	}
	else {
		new Ajax.Request("https://groups.google.com/group/mode-switcher/feed/rss_v2_0_topics.xml?num=" + limit, {
				method: "get",
				contentType: "application/rss+xml",
				evalJSON: true,
				encoding: null,
				requestHeaders: {},
				onSuccess: function(response) {
					this.modelImportGDList.items.clear();

					var data = response.responseText;
			
					for(var index = data.indexOf("<item>"); index != -1; index = data.indexOf("<item>")) {
						data = data.substr(index + 6);

						index = data.indexOf("</item>");

						if(index != -1) {
							var item = data.substr(0,index);

							data = data.substr(index + 6);

							var btIndex = item.indexOf("<title>");
							var etIndex = item.indexOf("</title>");
							var bdIndex = item.indexOf("<description>");
							var edIndex = item.indexOf("</description>");
						
							if((btIndex != -1) && (etIndex != -1) && (bdIndex != -1) && (edIndex != -1)) {
								var title = item.substring(btIndex + 7, etIndex);
								var desc = item.substring(bdIndex + 13, edIndex);

								var sIndex = title.indexOf(" - ");
								var msIndex = desc.indexOf(this.filter);

								var buIndex = desc.indexOf("http://");
								var euIndex = desc.indexOf("/edit?hl=en");

								if((msIndex != -1) && (sIndex != -1) && (buIndex != -1) && (euIndex != -1) && (buIndex < euIndex)) {
									var url = desc.substring(buIndex, euIndex);

									title = title.substring(sIndex + 3);
									desc = desc.substring(0, msIndex);

									if(this.modelImportGDMatch.value.length > 0) {
										var matchArray = this.modelImportGDMatch.value.split(" ");
										
										for(var i = 0; i < matchArray.length; i++) {
											if(matchArray[i].length > 0) {
							 					var regexp = new RegExp("/*" + matchArray[i] + "*", "i");

												if(title.match(regexp) != null) {
													this.modelImportGDList.items.push({'label': title, 'desc': desc, 'value': url});
												
													break;
												}
											}
										}
									}
									else
										this.modelImportGDList.items.push({'label': title, 'desc': desc, 'value': url});									
								}								
							}
						}
					}

					if(this.modelImportGDOrdering.value == "title") {
						this.modelImportGDList.items.sort(this.sortAlphabeticallyFunction);
					}

					this.modelImportGDButton.disabled = false;

					this.controller.modelChanged(this.modelImportGDButton, this);

					this.modelWaitSpinner.spinning = false;
	
					this.controller.modelChanged(this.modelWaitSpinner, this);

					this.controller.get("overlay-scrim").hide();

					this.viewLevel = 1;

					this.controller.get('import').hide();
					this.controller.get('import-list').show();
				
					this.controller.modelChanged(this.modelImportGDList, this);
				}.bind(this),
				onFailure: function(response) {
					Mojo.Log.error("Unable to read Google Groups feed: " + response.responseText);

					this.modelImportGDButton.disabled = false;

					this.controller.modelChanged(this.modelImportGDButton, this);

					this.modelWaitSpinner.spinning = false;
	
					this.controller.modelChanged(this.modelWaitSpinner, this);

					this.controller.get("overlay-scrim").hide();
				
					this.controller.showAlertDialog({
						title: $L("Unable to read the feed!"),
						message: "<div align='justify'>" + $L("Unable to read the Google Groups feed. Try again later.") + "</div>",
						choices:[{label:$L("OK"), value:"ok", type:'default'}],
						preventCancel: true,
						allowHTMLMessage: true}); 
				}.bind(this)});
	}
}

GdmAssistant.prototype.listGooglePrivate = function(event) {
	if((!this.data) || (!this.data.title))
		var match = "";
	else
		var match = this.data.title;

	if(this.modelImportGDMatch.value.length > 0)
		match += "+" + this.modelImportGDMatch.value.replace(" ", "+");
	
	var order = "orderby=" + this.modelImportGDOrdering.value;
	
	new Ajax.Request("https://www.google.com/accounts/ClientLogin?accountType=HOSTED_OR_GOOGLE&Email=" + this.modelImportGDUsername.value + "&Passwd=" + encodeURIComponent(this.modelImportGDPassword.value) + "&service=writely&source=ModeSwitcher", {
		method: "post",
		onSuccess: function(response) { 
			var auth = response.responseText.split("\n")[2].split("=")[1];

			new Ajax.Request("https://docs.google.com/feeds/documents/private/full?alt=json&title=" + match + "&" + order, {
				method: "get",
				contentType: "application/atom+xml",
				encoding: null,
				evalJSON: true,
				requestHeaders: {
					"GData-Version": "2.0",
					"Authorization": "GoogleLogin auth=" + auth
				},
				onSuccess: function(response) {
					var data = null;

					try {	data = Mojo.parseJSON(response.responseText); } catch (e) { }

					this.modelImportGDList.items.clear();

					if((data) && (data.feed) && (data.feed.entry)) {
						for(var i = 0; i < data.feed.entry.length; i++) {
							var fullTitle = data.feed.entry[i].title['$t'];
							
							if((!this.filter) || (fullTitle.substr(0, this.filter.length) == this.filter)) {
								if(this.filter)
									fullTitle = fullTitle.substr(this.filter.length + 1);
							
								var descIndex = fullTitle.indexOf(" (");
								
								if(descIndex == -1) {
									var title = fullTitle;
									var desc = "No description";
								}
								else {
									var title = fullTitle.slice(0, descIndex);
									var desc = fullTitle.slice(descIndex + 2, -1);
								}
							
								this.modelImportGDList.items.push({'label': title, 'desc': desc, 'value': data.feed.entry[i].id['$t']});
							}
						}

						this.viewLevel = 1;

						this.controller.get('import').hide();
						this.controller.get('import-list').show();
						
						this.controller.modelChanged(this.modelImportGDList, this);
					}
					else {
						this.controller.showAlertDialog({
							title: $L("Unable to list documents!"),
							message: "<div align='justify'>" + $L("No documents matching the query.") + "</div>",
							choices:[{label:$L("OK"), value:"ok", type:'default'}],
							preventCancel: true,
							allowHTMLMessage: true}); 
					}

					this.modelWaitSpinner.spinning = false;
		
					this.controller.modelChanged(this.modelWaitSpinner, this);

					this.controller.get("overlay-scrim").hide();

					this.modelImportGDButton.disabled = false;

					this.controller.modelChanged(this.modelImportGDButton, this);
				}.bind(this),
				onFailure: function(response) { 
					Mojo.Log.error("Unable to list Google Docs documents: " + response.responseText);

					this.controller.showAlertDialog({
							title: $L("Unable to list documents!"),
							message: "<div align='justify'>" + $L("Failed to receive documents list from Google Docs.") + "</div>",
							choices:[{label:$L("OK"), value:"ok", type:'default'}],
							preventCancel: true,
							allowHTMLMessage: true});  

					this.modelWaitSpinner.spinning = false;
		
					this.controller.modelChanged(this.modelWaitSpinner, this);

					this.controller.get("overlay-scrim").hide();

					this.modelImportGDButton.disabled = false;

					this.controller.modelChanged(this.modelImportGDButton, this);
				}.bind(this)
			});
		}.bind(this),
		onFailure: function(response) { 
			Mojo.Log.error("Unable to login to Google docs: " + response.responseText);

			this.controller.showAlertDialog({
				title: $L("Unable to login!"),
				message: "<div align='justify'>" + $L("Login to Google Docs failed, please check your username and password.") + "</div>",
				choices:[{label:$L("OK"), value:"ok", type:'default'}],
				preventCancel: true,
				allowHTMLMessage: true}); 

			this.modelWaitSpinner.spinning = false;

			this.controller.modelChanged(this.modelWaitSpinner, this);

			this.controller.get("overlay-scrim").hide();

			this.modelImportGDButton.disabled = false;

			this.controller.modelChanged(this.modelImportGDButton, this);
		}.bind(this)
	});  
}

GdmAssistant.prototype.importDocumentData = function(event) {
	this.controller.stopListening(this.controller.get("ImportGDList"), Mojo.Event.listTap, 
		this.handlerImportModeData);

	this.controller.get("overlay-scrim").show();

	this.modelWaitSpinner.spinning = true;
	
	this.controller.modelChanged(this.modelWaitSpinner, this);

	if(this.modelImportGDShare.value) {
		var url = event.item.value.replace("document/d/", "feeds/download/documents/Export?docID=");
	
		new Ajax.Request(url + "&exportFormat=txt", {
			method: "get",
			contentType: "text/plain",
			evalJSON: true,
			encoding: null,
			requestHeaders: {
				"GData-Version": "3.0"
			},
			onSuccess: function(title, response) {
				this.modelWaitSpinner.spinning = false;
	
				this.controller.modelChanged(this.modelWaitSpinner, this);
			
				this.controller.get("overlay-scrim").hide();
			
				var data = {title: title, body: null};

				try {data.body = Mojo.parseJSON(response.responseText);} catch (e) {}

				if(data.body) {
					this.controller.showAlertDialog({
						title: $L("Download succesful!"),
						message: "<div align='justify'>" + $L("Downloading from Google Docs was succesful.") + "</div>",
						choices:[{label:$L("OK"), value:"ok", type:'default'}],
						preventCancel: true,
						allowHTMLMessage: true,
						onChoose: function(data, value) {
							if(this.callback)
								this.callback(data);	

							this.controller.stageController.popScene();
						}.bind(this, data)});
				}
				else {
					this.controller.showAlertDialog({
						title: $L("Invalid JSON data received!"),
						message: "<div align='justify'>" + $L("The received document data was not in proper JSON format.") + "</div>",
						choices:[{label:$L("OK"), value:"ok", type:'default'}],
						preventCancel: true,
						allowHTMLMessage: true}); 
				}
			}.bind(this, event.item.label),
			onFailure: function(response) {
				Mojo.Log.error("Unable to download from Google Docs: " + response.responseText);

				this.modelWaitSpinner.spinning = false;
	
				this.controller.modelChanged(this.modelWaitSpinner, this);
			
				this.controller.get("overlay-scrim").hide();

				this.controller.showAlertDialog({
					title: $L("Unable to download!"),
					message: "<div align='justify'>" + $L("Downloading from Google Docs failed, please try again later.") + "</div>",
					choices:[{label:$L("OK"), value:"ok", type:'default'}],
					preventCancel: true,
					allowHTMLMessage: true}); 
			}.bind(this)});
	}
	else {
		var url = event.item.value.replace("https://", "https://").replace("documents/private/full/document%3A", "download/documents/Export?docID=");

		new Ajax.Request("https://www.google.com/accounts/ClientLogin?accountType=HOSTED_OR_GOOGLE&Email=" + this.modelImportGDUsername.value + "&Passwd=" + encodeURIComponent(this.modelImportGDPassword.value) + "&service=writely&source=ModeSwitcher", {
			method: "post",
			onSuccess: function(response) { 
				var auth = response.responseText.split("\n")[2].split("=")[1];
			
				new Ajax.Request(url + "&exportFormat=txt", {
					method: "get",
					contentType: "text/plain",
					evalJSON: true,
					encoding: null,
					requestHeaders: {
						"GData-Version": "3.0",
						"Authorization": "GoogleLogin auth=" + auth
					},
					onSuccess: function(title, response) {
						this.modelWaitSpinner.spinning = false;
	
						this.controller.modelChanged(this.modelWaitSpinner, this);
			
						this.controller.get("overlay-scrim").hide();

						var data = {title: title, body: null};

						try {data.body = Mojo.parseJSON(response.responseText);} catch (e) {}

						if(data.body) {
							this.controller.showAlertDialog({
								title: $L("Download succesful!"),
								message: "<div align='justify'>" + $L("Downloading from Google Docs was succesful.") + "</div>",
								choices:[{label:$L("OK"), value:"ok", type:'default'}],
								preventCancel: true,
								allowHTMLMessage: true,
								onChoose: function(data, value) {
									if(this.callback)
										this.callback(data);	

									this.controller.stageController.popScene();
								}.bind(this, data)});
						}
						else {
							this.controller.showAlertDialog({
								title: $L("Invalid JSON data received!"),
								message: "<div align='justify'>" + $L("The received document data was not in proper JSON format.") + "</div>",
								choices:[{label:$L("OK"), value:"ok", type:'default'}],
								preventCancel: true,
								allowHTMLMessage: true}); 
						}
					}.bind(this, event.item.label),
					onFailure: function(response) { 
						Mojo.Log.error("Unable to download from Google Docs: " + response.responseText);

						this.modelWaitSpinner.spinning = false;
	
						this.controller.modelChanged(this.modelWaitSpinner, this);
			
						this.controller.get("overlay-scrim").hide();

						this.controller.showAlertDialog({
							title: $L("Unable to download!"),
							message: "<div align='justify'>" + $L("Downloading from Google Docs failed, please try again later.") + "</div>",
							choices:[{label:$L("OK"), value:"ok", type:'default'}],
							preventCancel: true,
							allowHTMLMessage: true}); 
					}.bind(this)
				});
			}.bind(this),
			onFailure: function(response) { 
				Mojo.Log.error("Unable to login to Google Docs: " + response.responseText);

				this.modelWaitSpinner.spinning = false;
	
				this.controller.modelChanged(this.modelWaitSpinner, this);
			
				this.controller.get("overlay-scrim").hide();

				this.controller.showAlertDialog({
					title: $L("Unable to login!"),
					message: "<div align='justify'>" + $L("Login to Google Docs failed, please check your username and password.") + "</div>",
					choices:[{label:$L("OK"), value:"ok", type:'default'}],
					preventCancel: true,
					allowHTMLMessage: true}); 
			}.bind(this)
		});  
	}
}

GdmAssistant.prototype.exportDocumentData = function(event) {
	var cookie = new Mojo.Model.Cookie('googledocs');

	cookie.put({username: this.modelExportGDUsername.value});

	this.controller.get("overlay-scrim").show();

	this.modelWaitSpinner.spinning = true;

	this.controller.modelChanged(this.modelWaitSpinner, this);

	this.modelExportGDButton.disabled = true;
	
	this.controller.modelChanged(this.modelExportGDButton, this);

	if(!this.filter)
		var slug = "";
	else
		var slug = this.filter + " ";

	if(this.modelExportGDTitle.value.length > 0)
		slug += encodeURIComponent(this.modelExportGDTitle.value.replace("/", "_").replace(":", "_"));
	else
		slug += "Exported Document";

	if(this.modelExportGDDesc.value.length > 0)
		slug += " (" + encodeURIComponent(this.modelExportGDDesc.value.replace("/", "_").replace(":", "_")) + ")";

	new Ajax.Request("https://www.google.com/accounts/ClientLogin?accountType=HOSTED_OR_GOOGLE&Email=" + this.modelExportGDUsername.value + "&Passwd=" + encodeURIComponent(this.modelExportGDPassword.value) + "&service=writely&source=ModeSwitcher", {
		method: "post",
		onSuccess: function(response) { 
			var auth = response.responseText.split("\n")[2].split("=")[1];
			
			new Ajax.Request("https://docs.google.com/feeds/upload/create-session/default/private/full?alt=json", {
				method: "post",
				contentType: "text/plain",
				evalJSON: true,
				encoding: null,
				requestHeaders: {
					"GData-Version": "3.0",
					"Authorization": "GoogleLogin auth=" + auth,
					"Slug": slug
				},
				onSuccess: function(response) {
					var docData = Object.toJSON(this.data.body);

					new Ajax.Request(response.getHeader('Location'), {
						method: "put",
						contentType: "text/plain",
						encoding: null,
						evalJSON: true,
						postBody: docData,
						onSuccess: function(response) {
							if(this.modelExportGDShare.value) {
								var aclData = "<entry xmlns='https://www.w3.org/2005/Atom' xmlns:gAcl='http://schemas.google.com/acl/2007'><category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/acl/2007#accessRule'/><gAcl:role value='reader'/><gAcl:scope type='default'/></entry>";

								var url = response.responseJSON.entry.id['$t'].replace("/id/","/default/private/full/");

								new Ajax.Request(url + "/acl", {
									method: "post",
									contentType: "application/atom+xml",
									encoding: null,
									postBody: aclData,
									requestHeaders: {
										"GData-Version": "3.0",
										"Authorization": "GoogleLogin auth=" + auth
									},
									onSuccess: function(url, response) {
										this.controller.showAlertDialog({
											title: $L("Uploading & sharing succesful!"),
											message: "<div align='justify'>" + $L("Sharing of Google Docs document was succesful. To let others in the group to know about the document send the email which will be opened for you.") + "</div>",
											choices:[{label:$L("OK"), value:"ok", type:'default'}],
											preventCancel: true,
											allowHTMLMessage: true,
											onChoose: function(url) {
												var date = new Date();

												date = date.toString();

												var index = date.indexOf(" GMT");

												if(index != -1)
													date = date.substring(0, index);

												url = url.replace("feeds/default/private/full/document%3A", "document/d/") + "/edit?hl=en";

												this.controller.serviceRequest("palm://com.palm.applicationManager", {
													method: 'open', parameters: {id: "com.palm.app.email", params: {
													summary: date + " - " + this.modelExportGDTitle.value,
													text: this.modelExportGDDesc.value + "<br><br>" + this.filter + " <a href=" + url + ">" + url + "</a>",
													recipients: [{
														type: "email",
														role: 1,
														value: "mode-switcher@googlegroups.com",
														contactDisplay: "Mode Switcher Group"
													}]}}}); 

												this.controller.stageController.popScene();										
											}.bind(this, url)});
									}.bind(this, url),
									onFailure: function(response) {
										Mojo.Log.error("Unable to share Google Docs document: " + response.responseText);

										this.controller.showAlertDialog({
											title: $L("Unable to share!"),
											message: "<div align='justify'>" + $L("Sharing of Google Docs document failed, please try again later.") + "</div>",
											choices:[{label:$L("OK"), value:"ok", type:'default'}],
											preventCancel: true,
											allowHTMLMessage: true}); 

										this.modelWaitSpinner.spinning = false;

										this.controller.modelChanged(this.modelWaitSpinner, this);

										this.controller.get("overlay-scrim").hide();

										this.modelExportGDButton.disabled = false;

										this.controller.modelChanged(this.modelExportGDButton, this);
									}.bind(this)
								});
							}
							else {
								this.controller.showAlertDialog({
									title: $L("Upload Succesful!"),
									message: "<div align='justify'>" + $L("Uploading to Google Docs was succesful.") + "</div>",
									choices:[{label:$L("OK"), value:"ok", type:'default'}],
									preventCancel: true,
									allowHTMLMessage: true,
									onChoose: function() {
										this.controller.stageController.popScene();										
									}.bind(this)});
							}
						}.bind(this),
						onFailure: function(response) {
							Mojo.Log.error("Unable to upload to Google Docs: " + response.responseText);

							this.controller.showAlertDialog({
								title: $L("Unable to upload!"),
								message: "<div align='justify'>" + $L("Uploading to Google Docs failed, please try again later.") + "</div>",
								choices:[{label:$L("OK"), value:"ok", type:'default'}],
								preventCancel: true,
								allowHTMLMessage: true}); 

							this.modelWaitSpinner.spinning = false;

							this.controller.modelChanged(this.modelWaitSpinner, this);

							this.controller.get("overlay-scrim").hide();

							this.modelExportGDButton.disabled = false;
	
							this.controller.modelChanged(this.modelExportGDButton, this);
						}.bind(this)});
				}.bind(this),
				onFailure: function(response) { 
					Mojo.Log.error("Unable to upload to Google Docs: " + response.responseText);

					this.controller.showAlertDialog({
						title: $L("Unable to upload!"),
						message: "<div align='justify'>" + $L("Upload request to Google Docs failed, please try again later.") + "</div>",
						choices:[{label:$L("OK"), value:"ok", type:'default'}],
						preventCancel: true,
						allowHTMLMessage: true}); 

					this.modelWaitSpinner.spinning = false;

					this.controller.modelChanged(this.modelWaitSpinner, this);

					this.controller.get("overlay-scrim").hide();

					this.modelExportGDButton.disabled = false;
	
					this.controller.modelChanged(this.modelExportGDButton, this);
				}.bind(this)
			});  
		}.bind(this),
		onFailure: function(response) { 
			Mojo.Log.error("Login to Google Docs failed: " + response.responseText);
		
			this.controller.showAlertDialog({
				title: $L("Unable to login!"),
				message: "<div align='justify'>" + $L("Login to Google Docs failed, please check your username and password.") + "</div>",
				choices:[{label:$L("OK"), value:"ok", type:'default'}],
				preventCancel: true,
				allowHTMLMessage: true}); 

			this.modelWaitSpinner.spinning = false;

			this.controller.modelChanged(this.modelWaitSpinner, this);

			this.controller.get("overlay-scrim").hide();

			this.modelExportGDButton.disabled = false;
	
			this.controller.modelChanged(this.modelExportGDButton, this);
		}.bind(this)
	});  
}

//

GdmAssistant.prototype.initializeGoogleMaps = function() {
	if(this.data) {
		var latlng = new google.maps.LatLng(this.data.lat, this.data.lng);
		var zoom = 12;
	}
	else {
		var latlng = new google.maps.LatLng(64.000, 26.000);
		var zoom = 5;
	}

	var mapOptions = {
		'zoom': zoom,
		'center': latlng,
		'mapTypeId': google.maps.MapTypeId.ROADMAP,
		'draggable': true,
		'mapTypeControl': false,
		'scaleControl': false,
		'navigationControl': false };

	this.map = new google.maps.Map(this.controller.get("MapViewCanvas"), mapOptions);

	this.marker = new google.maps.Marker({
		'position': latlng, 
		'map': this.map, 
		'title': "Location" });
  
	var rad = 200;
	
	if((this.data) && (this.filter))
		rad = parseInt(this.filter);
  
	var circle = new google.maps.Circle({
		map: this.map,
		radius: rad
	});
  
	circle.bindTo('center', this.marker, 'position');
  
	google.maps.event.addListener(this.map, 'click', function(event) {
		this.marker.setPosition(event.latLng);
	}.bind(this));
	
	this.geocoder = new google.maps.Geocoder();
}

GdmAssistant.prototype.updateMapLocation = function(event) {
	this.geocoder.geocode({'address': this.modelMapViewAddress.value}, function(results, status) {
		if(status == google.maps.GeocoderStatus.OK) {
			if(results.length > 0) {
				this.map.setCenter(results[0].geometry.location);
				this.map.setZoom(12);
				this.marker.setPosition(results[0].geometry.location);
			}
		}
	}.bind(this));
}

//

GdmAssistant.prototype.sortAlphabeticallyFunction = function(a, b) {
	var c = a.label.toLowerCase();
	var d = b.label.toLowerCase();

	return ((c < d) ? -1 : ((c > d) ? 1 : 0));
}

//

GdmAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.back) {
		event.stop();

		if(this.viewLevel > 0) {
			this.viewLevel--;
	
			this.controller.listen(this.controller.get("ImportGDList"), Mojo.Event.listTap, 
				this.handlerImportModeData);

			this.controller.get('import-list').hide();
			this.controller.get('import').show();
		}
		else
			this.controller.stageController.popScene();			
	}
	else if(event.command == "zoom_out") {
		var zoom = this.map.getZoom();
		if(zoom > 0)
			zoom--;
			
		this.map.setZoom(zoom);
	}
	else if(event.command == "zoom_in") {
		var zoom = this.map.getZoom();
		if(zoom < 20)
			zoom++;
			
		this.map.setZoom(zoom);
	}
	else if(event.command == "done") {
		if(this.callback) {
			var latlng = this.marker.getPosition();

			this.callback(latlng.lat(), latlng.lng(), true);
			
			this.controller.stageController.popScene();			
		}
	}
	else if(event.command == "help") {
		this.controller.stageController.pushScene("support", this.customModes);
	}
}

//

GdmAssistant.prototype.cleanup = function() {
}

GdmAssistant.prototype.activate = function() {
}

GdmAssistant.prototype.deactivate = function() {
}

