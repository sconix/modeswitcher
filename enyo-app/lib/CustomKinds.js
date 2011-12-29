enyo.kind({
	name: "CustomPageHeader",
	kind: enyo.Control,
	
	_selected: false,
	_icon: "",
	_title: "",
	_version: "",
	_tagline: "",
	
	published: {
		icon: "",
		title: "",
		version: "",
		taglines: []
	},
	
	components: [
		{kind: "PageHeader", components: [
			{kind: "HFlexBox", flex: 1, className: "custom-page-header", components: [
				{name: "customPageHeaderIcon", kind: "Image", className: "icon"},
				{flex: 1, className: "text", components: [
					{kind: "HFlexBox", components: [
						{name: "customPageHeaderTitle", className: "title", allowHtml: true},
						{name: "customPageHeaderVersion", flex: 1, className: "version"}
					]},
					{name: "customPageHeaderTagline", className: "tagline", allowHtml: true}
				]}
			]}
		]}
	],
	
	rendered: function() {
		if(!this._selected) {
			this._icon = this.icon || enyo.fetchAppInfo().icon;
			this._title = this.title   || enyo.fetchAppInfo().title;
			this._version = "v" + (this.version || enyo.fetchAppInfo().version);
			this._tagline	= this.randomTagline() || "&nbsp;";
			this._selected	= true;
		}
		
		this.$.customPageHeaderIcon.setSrc(this._icon);
		this.$.customPageHeaderTitle.setContent(this._title);
		this.$.customPageHeaderVersion.setContent(this._version);
		
		this.$.customPageHeaderTagline.setContent(this._tagline);
	},
	
	randomTagline: function() {
		var w = 0;
		
		if(this.taglines.length == 0)
			return false;
		
		for(var r = 0; r < this.taglines.length; r++) {
			if(!this.taglines[r].weight)
				this.taglines[r].weight = 1;
			
			w += this.taglines[r].weight;
		}
		
		var ran = Math.floor(Math.random() * w) + 1;
		
		for(var r = 0; r < this.taglines.length; r++) {
			if(ran <= this.taglines[r].weight)
				return this.taglines[r].text;
			else
				ran -= this.taglines[r].weight;
		}
		
		return this.taglines[0].text;
	}	
});

enyo.kind({
	name: "CustomSlidingTag",
	kind: enyo.Control,
	
	components: [{
		name: "TagMarker", className: "custom-sliding-tag"
	}]
});

