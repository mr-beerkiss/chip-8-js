class CPU {
  constructor(renderer, keyboard, speaker) {
    this.renderer = renderer;
    this.keyboard = keyboard;
    this.speaker = speaker;

    // 4KB (4096 bytes) of memory
    this.memory = new Uint8Array(4096);

    // 16 8-bit registers
    this.v = new Uint8Array(16);

    // Stores memory addresses. Set this to 0 since we aren't storing antying at initialisation
    this.i = 0;

    // Timers
    this.delayTimer = 0;
    this.soundTimer = 0;

    // Program counter. Stores the currently executing address.
    this.pc = 0x200;

    // Don't initialise this with a size in order to avoid empty results.
    this.stack = new Array();

    // some instructions require pausing, such as Fx0A.
    this.paused = false;

    this.speed = 10;
  }

  loadSpritesIntoMemory() {
    // Array of hex values for each sprite. Each sprite is 5 bytes.
    // The technical reference provides us with each one of these values.
    // prettier-ignore
    const sprites = [
      0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
      0x20, 0x60, 0x20, 0x20, 0x70, // 1
      0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
      0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
      0x90, 0x90, 0xF0, 0x10, 0x10, // 4
      0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
      0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
      0xF0, 0x10, 0x20, 0x40, 0x40, // 7
      0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
      0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
      0xF0, 0x90, 0xF0, 0x90, 0x90, // A
      0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
      0xF0, 0x80, 0x80, 0x80, 0xF0, // C
      0xE0, 0x90, 0x90, 0x90, 0xE0, // D
      0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    ];

    // According to technical reference, sprites are stored in the interpreter section of memory,
    // starting at 0x0000
    for (let i = 0; i < sprites.length; i++) {
      this.memory[i] = sprites[i];
    }
  }

  loadProgramIntoMemory(program) {
    // spec says "most Chip-8 programs start at location 0x200", so offset when copying rom into
    // memory
    for (let loc = 0; loc < program.length; loc++) {
      this.memory[0x200 + loc] = program[loc];
    }
  }

  // TODO: Rewrite with fetch
  loadRom(romName) {
    var request = new XMLHttpRequest();
    var self = this;

    // Handles the response received from sending (request.send()) our request
    request.onload = function () {
      // If the request response has content
      if (request.response) {
        // Store the contents of the response in an 8-bit array
        let program = new Uint8Array(request.response);

        // Load the ROM/program into memory
        self.loadProgramIntoMemory(program);
      }
    };

    // Initialize a GET request to retrieve the ROM from our roms folder
    request.open("GET", "roms/" + romName);
    request.responseType = "arraybuffer";

    // Send the GET request
    request.send();
  }

  cycle() {
    for (let i = 0; i < this.speed; i++) {
      if (!this.paused) {
        let opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
        this.executeInstruction(opcode);
      }

      if (!this.paused) {
        this.updateTimers();
      }

      this.playSound();
      this.renderer.render();
    }
  }

  updateTimers() {
    if (this.delayTimer > 0) {
      this.delayTimer -= 1;
    }

    if (this.soundTimer > 0) {
      this.soundTimer -= 1;
    }
  }

  playSound() {
    if (this.soundTimer > 0) {
      this.speaker.play(440);
    } else {
      this.speaker.stop();
    }
  }

  executeInstruction(opcode) {
    // increment the program counter (this.pc) to prepare it for the next instruction.
    // Each instruction is 2 bytes long, so increment it by 2
    this.pc += 2;

    // x is the second nibble of instruction, so grab the value (&) and shift right (>>) by
    // 8 bits to discard the rest
    let x = (opcode & 0x0f00) >> 8;

    // y is the third nibble of the instruction, so grab the value (&) and shift right (>>) by
    // 4 bits to discard the rest
    let y = (opcode & 0x00f0) >> 4;
  }
}

export default CPU;
