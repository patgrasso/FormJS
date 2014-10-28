/*global document*/
/*global console*/
/*global DEBUG: true*/

var DEBUG = 1;

/**
 * A form that is drawn to an HTML canvas that has input listeners to
 * make it act like a real form. It is useful for canvas games which
 * require form input.
 */
function Form(canvas) {
    "use strict";

    // Check to make sure Form is instantiated and not just called like a
    // regular function
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

    /**
     * Erases the rendered form by clearing the entire canvas
     */
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

    /**
     * Selects the form element at [index]. The form element's select()
     * method is called so that it can render/handle further actions
     */
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
     * Add a click event listener to handle clicking (this could mean selecting
     * a form element, or choosing from a dropdown, etc.)
     * 
     * TODO: Dispatch click to form element, so it may interpret the click on
     *       its own
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
     * Add a keydown event listener for keyboard input. The entered keycode is
     * dispatched to either a form element's handleInput() or handleShiftedInput()
     * method, depending on whether the SHIFT key was pressed during input
     */
    document.addEventListener('keydown', function (event) {
        if (selectedIndex !== null) {
            // If the key was TAB (kc: 9), select next form element
            if (event.keyCode === 9) {
                selectFormElement((selectedIndex + (event.shiftKey ? formElements.length - 1 : 1)) % formElements.length);
                event.preventDefault();
            }
            // If the key was SPACE (kc: 32), prevent default behaviour
            if (event.keyCode === 32) {
                event.preventDefault();
            }
            if (!event.shiftKey) {
                formElements[selectedIndex].handleInput(event.keyCode);
            } else {
                formElements[selectedIndex].handleShiftedInput(event.keyCode);
            }
            formElements[selectedIndex].render();
        }

        if (DEBUG) {
            console.log(event);
            console.log({
                charCode: event.charCode,
                keyCode: event.keyCode,
                chr: String.fromCharCode(event.keyCode)
            });
        }
    }, false);

    /**
     * Sets the canvas context's font. Accepts the form:
     *      [font-size] [font-style]
     * e.g.       "14px sans-serif"
     * as a string
     */
    this.setFont = function (font) {
        ctx.font = font;
    };

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
        fontHeight,
        cursorIndex = 0;

    this.value = "";
    this.name = name;
    this.width = width || 200;
    this.height = height || 25;
    this.x = 0;
    this.y = 0;


    /**
     * Clears the entire TextBox
     */
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
        ctx.fillText(name, x, y + fontHeight);
        y += fontHeight + 4;

        // Draw TextBox
        ctx.strokeRect(x, y, this.width, this.height);

        // Draw value
        ctx.fillText(this.value, x + 2, y + (this.height + fontHeight) / 2 - 2);

        // Draw cursor
        if (selected) {
            ctx.fillRect(x + ctx.measureText(this.value.slice(0, cursorIndex)).width + 1, y + 2, 2, this.height - 4);
        }

        return this.height + fontHeight;
    };

    /**
     * De-selects the TextBox. "Unfocuses" the element
     */
    this.unselect = function () {
        selected = false;
        this.render();
    };

    /**
     * Selects the TextBox. "Focuses" the element
     */
    this.select = function () {
        selected = true;
        this.render();
    };

    /**
     * Should be used primarily by a Form object to set the canvas on which
     * drawing should occur (but note that it takes the canvas context, not
     * the actual canvas itself)
     *
     * TODO: Make this so that ONLY the Form object can access it
     */
    this.setContext = function (context) {
        ctx = context;
        fontHeight = parseInt(ctx.font, 10);
    };

    /**
     * Handles normal (non-shifted) user input. Special rules apply to various
     * ranges of key codes:
     *
     *      65-90 : Lowercase letters
     *      48-57 : Numbers
     *      97-105: Keypad numbers (treated as normal numbers)
     *      46    : Delete the letter in front of the cursor
     *      8     : Backspace (delete) the letter behind the cursor
     *      37/39 : Arrowkeys -- adjusts the cursor position
     *
     * Any input that is not recognized by any of these conditions might be
     * picked up in the [keymap] object and translated (keyboard input needs
     * to be power-washed clean in JS)
     */
    this.handleInput = function (keyCode) {
        var keymap = {
                32: ' ',
                96: '0',
                187: '=',
                188: ',',
                189: '-',
                190: '.',
                191: '/',
                192: '`',
                219: '[',
                220: '\\',
                221: ']',
                222: "'",
                186: ';'
            };
        if (keyCode >= 65 && keyCode <= 90) {
            this.input(String.fromCharCode(keyCode + 32));
        }
        if (keyCode >= 48 && keyCode <= 57) {
            this.input(String.fromCharCode(keyCode));
        }
        if (keyCode >= 97 && keyCode <= 105) {
            this.input(String.fromCharCode(keyCode - 48));
        }
        if (keyCode === 46) {
            this.value = this.value.slice(0, cursorIndex) + this.value.slice(cursorIndex + 1);
        }
        if (keyCode === 8) {
            this.value = this.value.slice(0, cursorIndex - 1) + this.value.slice(cursorIndex);
            cursorIndex -= (cursorIndex <= 0) ? 0 : 1;
        }
        if (keyCode === 37) {
            cursorIndex -= 1;
        }
        if (keyCode === 39) {
            cursorIndex += 1;
        }
        if (keymap[keyCode] !== undefined) {
            this.input(keymap[keyCode]);
        }
    };

    /**
     * See handleInput() for explanation of input handling. The only difference
     * for shifted input is the keymap for symbols and capitalization of letters.
     * If not either of these cases, the default handleInput() method is called
     * for the keyCode
     */
    this.handleShiftedInput = function (keyCode) {
        var keymap = {
                32: ' ',
                49: '!',
                50: '@',
                51: '#',
                52: '$',
                53: '%',
                54: '^',
                55: '&',
                56: '*',
                57: '(',
                58: ')',
                187: '+',
                188: '<',
                189: '_',
                190: '>',
                191: '?',
                192: '~',
                219: '{',
                220: '|',
                221: '}',
                222: '"',
                186: ':'
            };
        if (keyCode >= 65 && keyCode <= 90) {
            this.input(String.fromCharCode(keyCode));
        } else if (keymap[keyCode] !== undefined) {
            this.input(keymap[keyCode]);
        } else {
            this.handleInput(keyCode);
        }
    };

    /**
     * Inserts one character at the position of the cursor, the value stored in this.value
     */
    this.input = function (character) {
        this.value = this.value.slice(0, cursorIndex) + character + this.value.slice(cursorIndex);
        cursorIndex += 1;
    };
}



/**
 * Initialize the canvas, Form, and TextBoxes to populate the form
 */
function initializeCanvas() {
    "use strict";

    var fm = new Form(document.getElementById("canvas"));
    fm.setFont("18px sans-serif");
    fm.add(new TextBox("name"));
    fm.add(new TextBox("year"));
    fm.add(new TextBox("age", 25, 25));
    fm.render(10, 10);
}