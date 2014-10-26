function Form(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.ctx.fillStyle = "#FF0000";
	this.ctx.fillRect(0,0,150,75);
	this.formElements = [];
	
	this.clear = function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);	
	}
	
	this.render = function(x, y) {
		if (y === null) y = 0;
		for (var i = 0; i < formElements.length; i++) {
			y += formElements[i].render(x, y);
		}
	}
	
	this.append = function(formElement) {
		formElements.push(formElement);
        console.log(formElements);
	}
	
	return this;
}

// TextBox object
function TextBox(ctx, name) {
	this.ctx = ctx;
	this.value = "";
	this.name = name;
	
	this.render = function(x, y, width, height) {
		if (width === null && height === null) {
			width = 100;
			height = 25;
		}
		ctx.rect(x, y, width, height);
		return height;
	}
	
	return this;
}

function initializeCanvas() {
	var fm = Form(document.getElementById("canvas"));
    fm.append(TextBox(fm.ctx, "name"));
    fm.render();
}