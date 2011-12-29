enyo.kind({
	name: "Startup",
	kind: enyo.VFlexBox,
	className: "basic-back",
	flex: 1,
	
	events: {
		onDone: ""
	},
	
	components: [{
		name: "pageHeader", kind: "wi.Header", random: [{weight: 100, tagline: "Welcome to Tweaks!"}]
	}, {
		layoutKind: "VFlexLayout", flex: 1, align: "left", style: "padding-right: 10px; font-size: 14px;", components: [{		
			name: "changelogScroller", kind: "Scroller", height: "613px", components: [{
				name: "instructions", content: "<br><center><b>Here is some basic info for new users:</b></center><ul>" +
					"<li>Currently the application itself does not provide any tweaks, instead they are provided by patches</li>" +
					"<li>You can install patches using Preware, and you can recognize patches that have tweaks available by looking for the green plus band-aid badge</li>" +
					"<li>When you change the settings for a running application, you need to restart the application to see the change</li>" +
					"</ul><br>"
			},{
				kind: "Divider", caption: "1.5.2"
			},{
				content: "<ul><li>Small update for the tablet user interface</li></ul>"
			},{
				kind: "Divider", caption: "1.5.1"
			},{
				content: "<ul><li>Small bug fix for the tablet user interface</li></ul>"
			},{
				kind: "Divider", caption: "1.5.0"
			},{
				content: "<ul><li>Added enyo based user interface for the tablet</li></ul>"
			},{
				kind: "Divider", caption: "1.3.3"
			},{
				content: "<ul><li>Added more characters to be allowed for the text fields</li></ul>"
			},{
				kind: "Divider", caption: "1.3.2"
			},{
				content: "<ul><li>Promotional release to support sconix, no new features</li></ul>"
			},{
				kind: "Divider", caption: "1.3.1"
			},{
				content: "<ul><li>Fixed text field tweaks not count as new tweaks bug</li></ul>"
			},{
				kind: "Divider", caption: "1.3.0"
			},{
				content: "<ul><li>Added support for basic text field widget</li></ul>"
			},{
				kind: "Divider", caption: "1.2.0"
			},{
				content: "<ul><li>Work around the fatal webOS 2.x db permissions bug</li></ul>"
			},{
				kind: "Divider", caption: "1.1.0"
			},{
				content: "<ul><li>Allow for the tweaks json file to override the owner value</li></ul>"
			},{
				kind: "Divider", caption: "1.0.0"
			},{
				content: "<ul><b>Requires webOS 2.0.0 or newer to work!</b><li>Initial release of Tweaks app for webOS</li></ul>"
			}]
		}]
	},{
		kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [{
			content: "Ok, I've read this. Let's continue ...", onclick: "doneReading"
		}]
	}],

	rendered: function() {
		this.inherited(arguments);

		this.adjustScroller();
	},

	adjustScroller: function() {
		var s = enyo.fetchControlSize(this);

		this.$.changelogScroller.applyStyle("height", (s.h - 87) + "px");
	},
	
	hideWelcome: function() {
		this.$.pageHeader.$.tagline.setContent("Have you already <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZFYPT3NYR36YJ\">donated</a>?");
	
		this.$.instructions.hide();
	},
	
	doneReading: function(inSender, inEvent) {
		this.doDone();
	}
});
