enyo.kind({
	name: "Help",
	kind: enyo.VFlexBox,
	flex: 1,
	
	components: [{
		kind: "Scroller", flex: 1, components: [{
			name: "custom", style: "padding: 13px 18px 13px 18px; font-size: 16px; text-align: justify;", components: [{
				name: "text", allowHtml: true, content: ""
			}]
		}]
	}],
	
	update: function(page) {
		if(page == "current") {
			this.$.text.setContent("The information shown here can be used to find problems with your profile / situation configuration.<br><br>" + 
				"<center><div class='enyo-label'>" + "Current Profile" + "</div></center><br>" + "This shows all the settings that the current profiles have changed and their respective values. If the profiles have same settings then the applying order of profiles determines from which the value is taken." + "<br><br>" +
				"<center><div class='enyo-label'>" + "Current Situation" + "</div></center><br>" + "This shows the current situation as seen by Mode Switcher. Only the triggers that your configured situations utilize are shown." + "<br><br>");
		}
		else if(page == "history") {
			this.$.text.setContent("Here you can see all the events handled by Mode Switcher.<br><br>" + 
					"<center><div class='enyo-label'>" + "Mode Change Events" + "</div></center><br>" + "These events show how mode was started, the name of the mode and what initiated the change." + "<br><br>" +
					"<center><div class='enyo-label'>" + "Trigger Received Events" + "</div></center><br>" + "These events show received trigger events that causes situations to be checked." + "<br><br>");
		}
	}
});
