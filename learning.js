// Person constructor
function Person(name, age, height) {
	this.name	= name;
	this.age	= age;
	this.height	= height;

	function birthday() {
		this.age += 1;
		this.print = function() {
			console.log(this.age);
		}
	}

	this.birthday = birthday;
}

