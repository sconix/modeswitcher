function StartupAssistant() {
	this.appControl = Mojo.Controller.getAppController();
	this.appAssistant = this.appControl.assistant;

	this.firstMessage = $L(
		"<center><b>Here are some basic info for new users:</b></center><br><ul>" +
		"<li>On first start <i>Mode Switcher</i> will fetch your current settings into <i>Default Mode</i> which is activated when no other mode is active</li>" +
		"<li>You can create basic <i>Normal Modes</i> and special <i>Modifier Modes</i> which can be activated manually or set to activate automatically</li>" + 
		"<li>Only one <i>Normal Mode</i> can be active at once and it overrides settings from <i>Default Mode</i>, name of the mode is shown in Top Bar</li>" +
		"<li>Multiple <i>Modifier Modes</i> can be active at once and they override settings from <i>Normal Modes</i>, indicated with '+' sign in Top Bar</li>" +
		"<li>The Top Bar information is enabled by <i>System Menus - Framework / Mode Menu</i> patches, available from Preware (both are required)</li>"+ 
		"</ul>");
	
	this.secondMessage = $L("Please consider making a <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=7A4RPR9ZX3TYS&lc=FI&item_name=Mode%20Switcher%20Application&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted\">donation</a> if you wish to show your appreciation.");

	this.newMessages = [
	{
		version: '2.5.5', log: [
			'<b>Requires WebOS 2.5.0 or newer to work!</b>',
			'Completely new service based version of Mode Switcher'
		]
	}];
	
	this.menuModel = {
		visible: true,
		items: [
			{ label: $L("Help"), command: 'help' } ]
	};
	
	this.cmdMenuModel =
	{
		visible: false, 
		items: [
		    {},
		    {
				label: $L("Ok, I've read this. Let's continue ..."),
				command: 'continue'
		    },
		    {} ]
	};
};

StartupAssistant.prototype.setup = function() {
	if(this.appAssistant.isNewOrFirstStart == 0)
		this.controller.get('title').innerHTML = $L('Changelog');
	else if(this.appAssistant.isNewOrFirstStart == 1) 
		this.controller.get('title').innerHTML = $L("Welcome To Mode Switcher");
	else if(this.appAssistant.isNewOrFirstStart == 2) 
		this.controller.get('title').innerHTML = $L("Mode Switcher Changelog");
	
	var html = '';

	if(this.appAssistant.isNewOrFirstStart == 0) {
		for(var m = 0; m < this.newMessages.length; m++) {
			html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'templates/changelog'});
			html += '<ul>';
			
			for(var l = 0; l < this.newMessages[m].log.length; l++)
				html += '<li>' + this.newMessages[m].log[l] + '</li>';

			html += '</ul>';
		}
	} 
	else {
		if(this.appAssistant.isNewOrFirstStart == 1)
			html += '<div class="text">' + this.firstMessage + '</div>';
	   
		if(this.appAssistant.isNewOrFirstStart != 0)
			html += '<div class="text">' + this.secondMessage + '</div>';

		for(var m = 0; m < this.newMessages.length; m++) {
			html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'templates/changelog'});
			html += '<ul class="changelog">';
			
			for(var l = 0; l < this.newMessages[m].log.length; l++)
				html += '<li>' + this.newMessages[m].log[l] + '</li>';

			html += '</ul>';
		}
	}

	this.controller.get('data').innerHTML = html;

	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	if(this.appAssistant.isNewOrFirstStart)
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	
	this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
};

StartupAssistant.prototype.activate = function(event) {
	this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
};

StartupAssistant.prototype.showContinue = function() {
	this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
};

StartupAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		if(event.command == 'continue')
			this.controller.stageController.swapScene({name: 'main', transition: Mojo.Transition.crossFade}, 'main', false);
		else if(event.command == 'help')		
			this.controller.stageController.pushScene("support");
	}
};

