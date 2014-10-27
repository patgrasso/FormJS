
/*global document*/
/*global console*/
/*global DEBUG*/
/**
 * A form that is drawn to an HTML canvas that has input listeners to
 * make it act like a real form. It is useful for canvas games which
 * require form input.
 */
function Form(canvas) {
    "use strict";

    if (!(this instanceof Form)) {
        throw new Error("Constructor called as a function.");
    }
    if (canvas === undefined || canvas.tagName !== "CANVAS") {
        throw new Error("No HTML Canvas element was passed into the constructor.");
    }

    var ctx = canvas.getContext("2d"),
        formElements = [],
        padding = parseInt(ctx.font, 10) + 8,
        selectedIndex = null;

    ctx.fillStyle = "#000";

    this.clear = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    /**
     * Renders all form elements on the canvas starting at position (x, y)
     */
    this.render = function (x, y) {
        var i;
        if (y === null) {
            y = 0;
        }
        for (i = 0; i < formElements.length; i += 1) {
            y += formElements[i].render(x, y);
            y += padding;
        }
    };

    function selectFormElement(index) {
        var i;
        selectedIndex = index;
        for (i = 0; i < formElements.length; i += 1) {
            formElements[i].unselect();
        }
        formElements[index].select();
    }

    /**
     * Adds an element to the form
     */
    this.add = function (formElement) {
        formElements.push(formElement);
        formElement.setContext(ctx);
    };

    /**
     * Add a click event listener to select form
     */
    canvas.addEventListener('click', function (event) {
        var i;
        for (i = 0; i < formElements.length; i += 1) {
            if (event.offsetX < formElements[i].x + formElements[i].width &&
                    event.offsetX > formElements[i].x &&
                    event.offsetY < formElements[i].y + formElements[i].height + parseInt(ctx.font, 10) + 4 &&
                    event.offsetY > formElements[i].y) {
                selectFormElement(i);
            }
        }
    }, false);

    /**
     * Add a keydown event listener to type text
     */
    document.addEventListener('keydown', function (event) {
        //TODO: Map all 'keyCodes' to appropriate functionalities
        var elem;
            //deleteCharacterCode = 127;
        if (selectedIndex !== null) {
            elem = formElements[selectedIndex];

            if (event.keyCode === 8) {
                elem.value = elem.value.substr(0, elem.value.length - 1);
            } else if (event.keyCode > 64 && event.keyCode < 91) {
                elem.value += String.fromCharCode((!event.shiftKey) * 32 + event.keyCode);
            }// else if (event.keyCode === deleteCharacterCode)
            elem.render();
        }

        if (DEBUG) {
            console.log(event);
        }
    }, true);

    this.formElements = formElements;
}



/**
 * A TextBox form element that can be added to a form. It's name appears
 * above the box, with the box having a variable width and height.
 */
function TextBox(name, height, width) {
    "use strict";

    var selected = false,
        ctx,
        fontHeight;

    this.value = "";
    this.name = name;
    this.width = width || 200;
    this.height = height || 25;
    this.x = 0;
    this.y = 0;



    this.clear = function () {
        ctx.clearRect(this.x, this.y, this.width, this.height + parseInt(ctx.font, 10) + 4);
    };

    /**
     * Renders the textbox at (x, y) on ctx
     * Returns the height so that the form renderer can place
     * the next element at an appropriate height
     */
    this.render = function (x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
        x = this.x;
        y = this.y;

        this.clear();

        // Draw TextBox name
        ctx.strokeText(name, x, y + fontHeight);
        y += fontHeight + 4;

        // Draw TextBox
        ctx.strokeRect(x, y, this.width, this.height);

        // Draw value
        ctx.strokeText(this.value, x + 2, y + (this.height + fontHeight) / 2 - 2);

        // Draw cursor
        if (selected) {
            ctx.fillRect(x + ctx.measureText(this.value).width + 4, y + 2, 2, this.height - 4);
        }

        return this.height;
    };

    this.unselect = function () {
        selected = false;
        this.render();
    };

    this.select = function () {
        selected = true;
        this.render();
    };

    this.setContext = function (context) {
        ctx = context;
        fontHeight = parseInt(ctx.font, 10);
    };
}

function initializeCanvas() {
    "use strict";

    var fm = new Form(document.getElementById("canvas"));
    fm.add(new TextBox("name"));
    fm.add(new TextBox("year"));
    fm.add(new TextBox("age", 25, 25));
    fm.render(10, 10);
    console.log(fm.formElements);
}