function Form(canvas) {
	var canvas = canvas;
	var ctx = canvas.getContext("2d");
	var formElements = [];
    var padding = parseInt(ctx.font) + 8;

    ctx.fillStyle = "#000";
	
	this.clear = function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);	
	}
	
    /**
     * Renders all form elements on the canvas starting at position (x, y)
     */
	this.render = function(x, y) {
		if (y === null) y = 0;
		for (var i = 0; i < formElements.length; i++) {
			y += formElements[i].render(ctx, x, y);
            y += padding;
		}
	}
	
    /**
     * Adds an element to the form
     */
	this.add = function(formElement) {
		formElements.push(formElement);
	}

    /**
     * Add a click event listener to select form
     */
    canvas.addEventListener('click', function(event) {
        console.log({x: event.x, y: event.y});
        ctx.fillRect(event.x, event.y, 1, 1);
    });

    this.formElements = formElements;
}

// TextBox : FormElement
function TextBox(name, height, width) {
	var value = "";
	var name = name;
    var width = width || 200;
    var height = height || 25;
    console.log(width);
    /**
     * Renders the textbox at (x, y) on ctx
     * Returns the height so that the form renderer can place
     * the next element at an appropriate height
     */
	this.render = function(ctx, x, y) {
        ctx.strokeText(name, x, y);
        y += 4;
		ctx.strokeRect(x, y, width, height);
		return height;
	}
}

function initializeCanvas() {
	var fm = new Form(document.getElementById("canvas"));
    fm.add(new TextBox("name"));
    fm.add(new TextBox("year"));
    fm.add(new TextBox("age", 25, 25));
    fm.render(10, 10);
    console.log(fm.formElements);
}