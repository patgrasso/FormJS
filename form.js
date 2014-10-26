function Form(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.ctx.fillStyle = "#000";
	this.formElements = [];
	
	this.clear = function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);	
	}
	
	this.render = function(x, y) {
		if (y === null) y = 0;
		for (var i = 0; i < formElements.length; i++) {
			y += formElements[i].render(ctx, x, y);
		}
	}
	
    /**
     * Adds an element to the form
     */
	this.push = function(formElement) {
		formElements.push(formElement);
        console.log(formElements);
	}
	
	return {
        canvas: this.canvas,
        ctx: this.ctx,
        formElements: this.formElements,
        clear: this.clear,
        render: this.render,
        push: this.push
    }
}

// TextBox : FormElement
function TextBox(name, _height, _width) {
	this.value = "";
	this.name = name;
    this.width = _width;
    this.height = _height;
    if (_width === undefined) this.width = 200;
    if (_height === undefined) this.height = 25;
    console.log(this.width);
    /**
     * Renders the textbox at (x, y) on ctx
     * Returns the height so that the form renderer can place
     * the next element at an appropriate height
     */
	this.render = function(ctx, x, y) {
		ctx.strokeRect(x, y, width, height);
        ctx.clearRect(x+1, y+1, width-1, height-1);
        // ^ this is needed to correct the unwanted border effect
		return height;
	}
	
	return {
        width: this.width,
        height: this.height,
        value: this.value,
        name: this.name,
        render: this.render
    }
}

function initializeCanvas() {
	var fm = Form(document.getElementById("canvas"));
    fm.push(TextBox("name"));
    fm.render(0, 0);
}