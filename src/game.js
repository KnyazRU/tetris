export default class Game {
    static points = {
        '1': 40,
        '2': 100,
        '3': 300,
        '4': 1200
    };

    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lines = 0;
        this.topOut = false;
        this.playfield = this.createPlayfield();
        this.activePiece = this.createPiece();
        this.nextPiece = this.createPiece();
    }

    get level() {
        return Math.floor(this.lines * 0.1);
    }

    getState() {
        const playfield = this.createPlayfield();
        const {x: pieceX, y: pieceY, bloks} = this.activePiece;

        for (let y = 0; y < this.playfield.length; y++) {
            playfield[y] = [];
            for (let x = 0; x < this.playfield[y].length; x++) {
                playfield[y][x] = this.playfield[y][x];
            }
        }

        for (let y = 0; y < bloks.length; y++) {
            for (let x = 0; x < bloks[y].length; x++) {
                if (bloks[y][x])
                    playfield[pieceY + y][pieceX + x] = bloks[y][x];
            }
        }

        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextPiece: this.nextPiece,
            playfield,
            isGameOver: this.topOut
        };
    }

    createPlayfield() {
        const playfield = [];
        for (let y = 0; y < 20; y++) {
            playfield[y] = [];

            for (let x = 0; x < 10; x++) {
                playfield[y][x] = 0;
            }
        }
        return playfield;
    }

    createPiece() {
        const index = Math.floor(Math.random() * 7);
        const type = 'IJLOSTZ'[index];
        const piece = {};

        switch(type) {
            case 'I':
                piece.bloks = [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'J':
                piece.bloks = [
                    [0, 0, 0],
                    [2, 2, 2],
                    [0, 0, 2]
                ];
                break;
            case 'L':
                piece.bloks = [
                    [0, 0, 0],
                    [3, 3, 3],
                    [3, 0, 0]
                ];
                break;
            case 'O':
                piece.bloks = [
                    [0, 0, 0, 0],
                    [0, 4, 4, 0],
                    [0, 4, 4, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'S':
                piece.bloks = [
                    [0, 0, 0],
                    [0, 5, 5],
                    [5, 5, 0]
                ];
                break;
            case 'T':
                piece.bloks = [
                    [0, 0, 0],
                    [6, 6, 6],
                    [0, 6, 0]
                ];
                break;
            case 'Z':
                piece.bloks = [
                    [0, 0, 0],
                    [7, 7, 0],
                    [0, 7, 7]
                ];
                break;
            default:
                throw new Error('Неизвестный тип фигур');
        }
        piece.x = Math.floor((10 - piece.bloks[0].length)/2);
        piece.y = -1;

        return piece;
    }

    movePieceLeft() {
        this.activePiece.x -= 1;
        if (this.hasCollision())
            this.activePiece.x += 1;
    }

    movePieceRight() {
        this.activePiece.x += 1;
        if (this.hasCollision())
            this.activePiece.x -= 1;
    }

    movePieceDown() {
        if (this.topOut) return;
        this.activePiece.y += 1;
        if (this.hasCollision()) {
            this.activePiece.y -= 1;
            this.lockPiece();
            const clearedLines = this.clearLines();
            this.updateScore(clearedLines);
            this.updatePieces();
        }
        if (this.hasCollision())
            this.topOut = true;
    }

    rotatePiece() {
        const bloks = this.activePiece.bloks;
        const length = bloks.length;
        const temp = [];
        for (let i = 0; i < length; i++) {
            temp[i] = new Array(length).fill(0);
        }
        for (let y = 0; y < length; y++) {
            for (let x = 0; x < length; x++) {
                temp[x][y] = bloks[length-1-y][x];
            }
        }
        this.activePiece.bloks = temp;
        if (this.hasCollision())
            this.activePiece.bloks = bloks;
    }

    hasCollision() {
        const playfield = this.playfield;
        const {x: pieceX, y: pieceY, bloks} = this.activePiece;
        for (let y = 0; y < bloks.length; y++) {
            for (let x = 0; x < bloks[y].length; x++) {
                if (bloks[y][x] &&
                    ((playfield[pieceY + y] === undefined || playfield[pieceY + y][pieceX + x] === undefined) ||
                    playfield[pieceY + y][pieceX + x])
                    )
                    return true;
            }
        }
        return false;
    }

    lockPiece() {
        const {x: pieceX, y: pieceY, bloks} = this.activePiece;
        for (let y = 0; y < bloks.length; y++) {
            for (let x = 0; x < bloks[y].length; x++) {
                if (bloks[y][x])
                    this.playfield[pieceY + y][pieceX + x] = bloks[y][x];
            }
        }
    }

    clearLines() {
        const rows = 20;
        const columns = 10;
        let lines = [];
        for (let y = rows -1; y >= 0; y--) {
            let numberOfBlocks = 0;
            for (let x = 0; x < columns; x++) {
                if (this.playfield[y][x])
                    numberOfBlocks +=1;
            }
            if (numberOfBlocks === 0) break;
                else if (numberOfBlocks < columns) continue;
                else if (numberOfBlocks === columns) lines.unshift(y);
        }
        for (const line of lines) {
            this.playfield.splice(line, 1);
            this.playfield.unshift(new Array(columns).fill(0));
        }
        return lines.length;
    }

    updateScore(clearedLines) {
        if (clearedLines > 0)
            this.score += Game.points[clearedLines] * (this.level +1);
            this.lines += clearedLines;
    }

    updatePieces() {
        this.activePiece = this.nextPiece;
        this.nextPiece = this.createPiece();
    }
}
