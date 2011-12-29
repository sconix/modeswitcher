MainServiceAssistant = function() {
}

//

MainServiceAssistant.prototype.setup = function() {
	this.queue = {commands: [], processes: []};
}

MainServiceAssistant.prototype.cleanup = function() {
}

//

MainServiceAssistant.prototype.appendCommand = function(future, args, run) {
	this.queue.commands.push({future: future, args: args, run: run});
		
	if((this.queue.commands.length == 1) && (this.queue.processes.length == 0))
		this.executeCommand();
}

MainServiceAssistant.prototype.executeCommand = function() {
	var future = new Future();

	var command = this.queue.commands[0];

	future.now(this, function(future) {
		command.run(future, command.args);
	}).then(this, function(future) {
		command.future.result = { returnValue: true };
		
		this.queue.commands.shift();

		if(this.queue.commands.length > 0)
			this.executeCommand();
		else if(this.queue.processes.length > 0)
			this.executeProcess();
	});			
}

//

MainServiceAssistant.prototype.appendProcess = function(future, args, run) {
	this.queue.processes.push({future: future, args: args, run: run});
		
	if((this.queue.commands.length == 0) && (this.queue.processes.length == 1))
		this.executeProcess();
}

MainServiceAssistant.prototype.executeProcess = function() {
	var future = new Future();

	var process = this.queue.processes[0];
	
	future.now(this, function(future) {
		process.run(future, process.args);
	}).then(this, function(future) {
		process.future.result = { returnValue: true };
		
		this.queue.processes.shift();
		
		if(this.queue.commands.length > 0)
			this.executeCommand();
		else if(this.queue.processes.length > 0)
			this.executeProcess();
	});			
}

