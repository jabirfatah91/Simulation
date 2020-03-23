'use strict';

// if set to true then object state will be printed after execution of each command
const DEBUG_MODE = false;

// if set to true then program will print out captions before asking some user input
const PRINT_CAPTIONS = true;


// this class represents object position on a table
// position wrapped into class so further could be extended to 3D space
class Position {
    // protected (in this class readonly) fields of class have prefix _ (it's not language syntax, it's codding convention)
    // declaration of fields commented to support browsers that have not implemented fields yet (ie: old versions of browsers, old Safari).
    /*_x = 0;
    _y = 0;*/

    // constructor to create position
    constructor (x, y) {
        this._x = x;
        this._y = y;
    }

    // getter method for
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    // method to change position
    change(x, y) {
        this._x = x;
        this._y = y;
    }

    // method to change position by moving on
    shift(dx, dy) {
        this._x += dx;
        this._y += dy;
    }

    toString() {
        // used Template literals (Template strings) to combine result string (Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
        return `[${this._x}, ${this._y}]`;
    }
}


// orientation is presented as a vector
class Orientation {
    /*_x = 0;
    _y = 0;*/

    // constructor to create orientation
    constructor (x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    rotateCW() {
        let x = this._x;
        this._x = -this._y;
        this._y = x;
    }

    rotateCCW() {
        let x = this._x;
        this._x = this._y;
        this._y = -x;
    }

    toString() {
        return `[${this._x}, ${this._y}]`;
    }

    // since we have an inverted y axis multiply coordinate Y by -1
    static get NORTH() {return  new Orientation(0, -1)}

    // since we have an inverted y axis multiply coordinate Y by -1
    static get SOUTH() {return  new Orientation(0, 1)}

    static get EAST()  {return  new Orientation(1, 0)}

    static get WEST()  {return  new Orientation(-1, 0)}
}


class Table {
    // width and height made readonly bcs we don't want to change table size after table has been created
    /*_width; _height;
    _shapes = [];*/

    // constructor to create table
    constructor(width, height) {
        this._width  = width;
        this._height = height;

        // shape list added so we can add table rotation and/or multiple objects on a table
        this._shapes = [];
    }

    // getters methods to read width and height
    get width()  {return this._width}
    get height() {return this._height}

    // this method adds object on a table
    addShape(shape) {
        this._shapes.push(shape);
    }

    rotate() {
        // to add table rotation we need to walk over list of all _shapes
        // and apply rotation and translation(shift) to each object/shape
        // translation applied in case we want to rotate table around it's center
    }
}



// basic class for any shape - rectangle, square, triangle, etc.
class Shape {
    /*_position;
    _orientation;*/

    constructor(position) {
        this._position = position;
        this._orientation = Orientation.NORTH;
    }

    get position() {
        return this._position;
    }

    execute(command) {
        this[command.name]();
    }

    moveForward() {
        if (DEBUG_MODE) {
            console.log('Move forward');
        }
        // since we have an inverted y axis invert the coordinate Y shift (multiply by -1)
        this._position.shift(this._orientation.x, this._orientation.y)
    }
    moveBackward() {
        if (DEBUG_MODE) {
            console.log('Move backward');
        }
        // since we have an inverted y axis invert the coordinate Y shift (multiply by -1; -1 * -1 = 1)
        this._position.shift(-this._orientation.x, -this._orientation.y)
    }
    rotateCW() {
        if (DEBUG_MODE) {
            console.log('Rotate CW');
        }
        this._orientation.rotateCW()
    }
    rotateCCW() {
        if (DEBUG_MODE) {
            console.log('Rotate CCW');
        }
        this._orientation.rotateCCW()
    }

    toString() {
        return `${this.constructor.name} {position: ${this._position.toString()}, orientation: ${this._orientation}}`;
    }
}

class Rectangle extends Shape {}


// this class is responsible for commands that simulation could accept
class Command {
    /*_index;
    _name;*/

    constructor(index, name) {
        this._index = index;
        this._name = name;
    }

    static findByIndex(commandIndex) {
        for (let command in commands){
            if (commands[command]._index === commandIndex) {
                return commands[command];
            }
        }
        return undefined;
    }

    get name() {
        return this._name;
    }
}

// known commands
const commands = {
    QUIT:           new Command(0, 'quit'),         // quit simulation
    MOVE_FORWARD:   new Command(1, 'moveForward'),  // move forward one step
    MOVE_BACKWARD:  new Command(2, 'moveBackward'), // move backwards one step
    ROTATE_CW:      new Command(3, 'rotateCW'),     //rotate clockwise 90 degrees (e.g. north to east)
    ROTATE_CCW:     new Command(4, 'rotateCCW'),    // rotate counterclockwise 90 degrees (e.g. west to south)
};



// this class responsible for user input parsing
// in the future implementation could be extended to parse json input
class InputParser {

    constructor(args) {
        if (args.length === 1 && (typeof args[0] === 'string' || args[0] instanceof String)) {
            this._input = InputParser.parseInput(args[0]);
        }
        else {
            this._input = args;
        }
    }

    get input() {
        return this._input;
    }

    static parseInput(inputString) {
        inputString = inputString.replace(/ /gi, '').replace(/^[,]+/gi, '').replace(/[,]+$/gi, '');
        let array = inputString.split(',');
        let input = [];
        for (let i = 0; i < array.length; i++) {
            let arg = Number(array[i]);
            if (!Number.isNaN(arg)) {
                input.push(arg);
            }
        }
        return input;
    }
}


// Simple version of moving objects simulation.
class Simulation {

    /*_table;
    _shape;*/

    // init method accepts variable number of parameters
    // creates table and object
    init(...args) {
        // arguments could be passes as array
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }

        let table = new Table(args[0], args[1]);
        let shape = new Rectangle(new Position(args[2], args[3]));

        if (DEBUG_MODE) {
            console.log('Initial object state:');
            console.log(shape.toString());
        }

        table.addShape(shape);

        // adding table to simulation
        this._table = table;

        // adding object to simulation
        // right now we have only one object on a table, but in the future we could add more and command to select object to be operated on
        this._shape = shape;
    }

    // runs simulation, accepts list of commands
    run(...args) {
        // arguments could be passes as array
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }

        for (let i = 0; i < args.length; i++) {
            let command = Command.findByIndex(args[i]);

            // we can remove command check, so program would ignore unknown commands
            if (undefined === command) {
                console.log(`Unknown command [index: ${args[i]}]. Interrupting simulation.`);
                break;
            }

            if (commands.QUIT === command) {
                break;
            }

            this._execute(command);
        }

        this._printResult();
    }

    // checks current status of simulation, whether object still on table or not
    _isObjectOnTable() {
        return  0 <= this._shape.position.x &&
                this._shape.position.x < this._table.width &&
                0 <= this._shape.position.y &&
                this._shape.position.y < this._table.height;
    }

    _printResult() {
        if (this._isObjectOnTable()) {
            // if simulation succeed then output object position
            console.log(this._shape.position.toString());
        }
        else {
            // as defined in task requirements if simulation failed (aka object fell from table) then output predefined array [-1,-1]
            console.log("[-1,-1]");
        }
    }

    _execute(command) {
        // some commands passed to the object, others could be passed to table in the future
        if ([commands.MOVE_BACKWARD, commands.MOVE_FORWARD, commands.ROTATE_CW, commands.ROTATE_CCW].includes(command)) {
            this._shape.execute(command);

            if (DEBUG_MODE) {
                console.log(this._shape.toString());
            }
        }
    }
}


if (typeof process === 'undefined' || !process.argv.includes('-test')) {
    // regular program run

    if (typeof module !== 'undefined' && module.exports) {
        // this branch responsible for program execution under node.js environment
        const io = require('console-read-write');
        this.main = async function () {
            // Simple readline scenario

            let simulation = new Simulation();

            if (PRINT_CAPTIONS) {
                io.write('Input table size and object position. Ex: 4,4,2,2');
            }
            let input = InputParser.parseInput(await io.read());
            simulation.init(input);

            if (PRINT_CAPTIONS) {
                io.write('Input simulation commands. Ex: 1,4,1,3,2,3,2,4,1,0');
            }
            input = InputParser.parseInput(await io.read());
            simulation.run(input);
        }
    }
    else {
        // this branch responsible for program execution under browser console
        let that = this;
        this.main = function () {
            that.simulation = new Simulation();
        }
    }

    this.main();
}
else {
    // run some test

    let simulation = new Simulation();

    // rotation CW for 360 deg
    console.log('\nrotation CW for 360 deg');
    simulation.init(4,4,2,2);
    simulation.run(3,3,3,3);

    // rotation CCW for 360 deg
    console.log('\nrotation CW for 360 deg');
    simulation.init(4,4,2,2);
    simulation.run(4,4,4,4);

    // move forward / backward
    console.log('\nmove forward / backward');
    simulation.init(4,4,2,2);
    simulation.run(1,1,2,2,1,1);

    // unexpected command
    console.log('\nunexpected command');
    simulation.init(4,4,2,2);
    simulation.run(1,12,2,2,1,1);

    // example data from task definition
    console.log('\nTask example data');
    simulation.init(4,4,2,2);
    simulation.run(1,4,1,3,2,3,2,4,1,0);
}