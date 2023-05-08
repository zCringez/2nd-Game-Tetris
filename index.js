// Wird ausgeführt, wenn  Seite geladen ist
window.onload = () =>
 {
     // Initialisieren von DOc-Elementen und Variablen für später
    const
        background = document.getElementById("background"),
        scoreLbl = document.getElementById("score"),
        linesLbl = document.getElementById("lines"),
        canvas = document.getElementById("game-canvas"),
        ctx = canvas.getContext("2d");
    
    
    class Tetromino {
        static COLORS = ["blue", "green", "yellow", "red", "orange", "light-blue", "purple"];
        static BLOCK_SIZE = 28;
        static DELAY = 200;
        static DELAY_INCREASED = 5;
    // Konstruktor für Tetromino-Objekte
        constructor(xs, ys, color = null) {
            this.x = xs;
            this.y = ys;
            this.length = xs.length;
            if (color !== null) {
                this.color = color;
                this.img = new Image();
                this.img.src = `resources/${Tetromino.COLORS[color]}.jpg`
            }
        }
      // Aktualisiert die Position des Tetrominos auf Bildschirm
        update(updFunc) {
            for (let i = 0; i < this.length; ++i) {
                ctx.clearRect(
                    this.x[i] * Tetromino.BLOCK_SIZE,
                    this.y[i] * Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE
                );

                updFunc(i);
            }

            this.draw();
        }
         // Zeichnet das Tetromino
        draw() {
            if (!this.img.complete) {
                this.img.onload = () => this.draw();
                return;
            }
            
            for (let i = 0; i < this.length; ++i) {
                ctx.drawImage(
                    this.img,
                    this.x[i] * Tetromino.BLOCK_SIZE,
                    this.y[i] * Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE
                );
            }
        }
        // Überprüft Kollisionen des Tetrominos mit anderen Blöcken oder den Spielfeldgrenzen
        collides(checkFunc) {
            for (let i = 0; i < this.length; ++i) {
                const { x, y } = checkFunc(i);
                if (x < 0 || x >= FIELD_WIDTH || y < 0 || y >= FIELD_HEIGHT || FIELD[y][x] !== false)
                    return true;
            }
            return false;
        }
        // Fügt das Tetromino zum Spielfeld hinzu (nachdem es nicht mehr bewegt werden kann)
        merge() {
            for (let i = 0; i < this.length; ++i) {
                FIELD[this.y[i]][this.x[i]] = this.color;
            }
        }
        // Dreht das Tetromino um 90 Grad
         rotate() {
            const
                maxX = Math.max(...this.x),
                minX = Math.min(...this.x),
                minY = Math.min(...this.y),
                nx = [],
                ny = [];

            if (!this.collides(i => {
                    nx.push(maxX + minY - tetromino.y[i]);
                    ny.push(tetromino.x[i] - minX + minY);
                    return { x: nx[i], y: ny[i] };
                })) {
                this.update(i => {
                    this.x[i] = nx[i];
                    this.y[i] = ny[i];
                });
            }
        }
    }
         //eröffnen von Spielfeldgröße, Tetrominos und Spielvariablen
    const
        FIELD_WIDTH = 10,
        FIELD_HEIGHT = 20,
        FIELD = Array.from({ length: FIELD_HEIGHT }),
        MIN_VALID_ROW = 4,
        TETROMINOES = [
            new Tetromino([0, 0, 0, 0], [0, 1, 2, 3]),
            new Tetromino([0, 0, 1, 1], [0, 1, 0, 1]),
            new Tetromino([0, 1, 1, 1], [0, 0, 1, 2]),
            new Tetromino([0, 0, 0, 1], [0, 1, 2, 0]),
            new Tetromino([0, 1, 1, 2], [0, 0, 1, 1]),
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 1]),
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 0])
        ];

    let tetromino = null,
        delay,
        score,
        lines;


    // leitet das Spiel ein
    (function setup() {

        canvas.style.top = Tetromino.BLOCK_SIZE;
        canvas.style.left = Tetromino.BLOCK_SIZE;

        ctx.canvas.width = FIELD_WIDTH * Tetromino.BLOCK_SIZE;
        ctx.canvas.height = FIELD_HEIGHT * Tetromino.BLOCK_SIZE;

    //Skalierung Hintergrund
        const scale = Tetromino.BLOCK_SIZE / 13.83333333333;
        background.style.width = scale * 166;
        background.style.height = scale * 304;

        // Tetrominos in die Mitte des Spielfelds verschiueben
        const middle = Math.floor(FIELD_WIDTH / 2);
        for (const t of TETROMINOES) t.x = t.x.map(x => x + middle);

        reset();
        draw();
    })();
    // Reset-Funktion,  Spielfeld leert und Variablen zurücksetzt
    function reset() {
        
        FIELD.forEach((_, y) => FIELD[y] = Array.from({ length: FIELD_WIDTH }).map(_ => false));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        delay = Tetromino.DELAY;
        score = 0;
        lines = 0;
    }

    function draw() {
        if (tetromino) {

            // Überprüft, ob das Tetromino kollidiert
            if (tetromino.collides(i => ({ x: tetromino.x[i], y: tetromino.y[i] + 1 }))) {
                tetromino.merge();
               
                tetromino = null;

                // Berechnung der abgeschlossenen Zeilen
                let completedRows = 0;
                for (let y = FIELD_HEIGHT - 1; y >= MIN_VALID_ROW; --y)
                    if (FIELD[y].every(e => e !== false)) {
                        for (let ay = y; ay >= MIN_VALID_ROW; --ay)
                            FIELD[ay] = [...FIELD[ay - 1]];

                        ++completedRows;
                      
                        ++y;
                    }

                if (completedRows) {
                // Löscht das gesamte Canvas und zeichnet das aktualisierte Spielfeld
                   
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (let y = MIN_VALID_ROW; y < FIELD_HEIGHT; ++y) {
                        for (let x = 0; x < FIELD_WIDTH; ++x) {
                            if (FIELD[y][x] !== false) new Tetromino([x], [y], FIELD[y][x]).draw();
                        }
                    }
                     // Aktualisiert den Spielstand und die Anzahl der abgeschlossenen Zeilen
                    score += [40, 100, 300, 1200][completedRows - 1];
                    lines += completedRows;
                } else {
                  // Überprüft, ob das Spiel verloren ist
                    if (FIELD[MIN_VALID_ROW - 1].some(block => block !== false)) {
                        alert("You have lost!");
                        reset();
                    }
                }


            } else
             // Bewegt das Tetromino nach unten
                tetromino.update(i => ++tetromino.y[i]);
        }
        
        else {
             // Aktualisiert die Anzeige von Spielstand und abgeschlossenen Zeilen
            scoreLbl.innerText = score;
            linesLbl.innerText = lines;

           // Erstellt ein neues, zufälliges Tetromino
            tetromino = (({ x, y }, color) =>
                new Tetromino([...x], [...y], color)
            )(
                TETROMINOES[Math.floor(Math.random() * (TETROMINOES.length - 1))],
                Math.floor(Math.random() * (Tetromino.COLORS.length - 1))
            );

            tetromino.draw();
        }
        // Pause-Logik
        let isPaused = false;

function draw() {
    if (!isPaused) {
        if (tetromino) {
            if (tetromino.collides(i => ({ x: tetromino.x[i], y: tetromino.y[i] + 1 }))) {
                tetromino.merge();
                tetromino = null;
            } else {
                tetromino.update(i => ++tetromino.y[i]);
            }
        } else {
            scoreLbl.innerText = score;
            linesLbl.innerText = lines;
            tetromino = (({ x, y }, color) =>
                new Tetromino([...x], [...y], color)
            )(
                TETROMINOES[Math.floor(Math.random() * (TETROMINOES.length - 1))],
                Math.floor(Math.random() * (Tetromino.COLORS.length - 1))
            );
            tetromino.draw();
        }
    }

        setTimeout(draw, delay);
    }
    //Steuerung
    window.onkeydown = event => {
        switch (event.key) {
            case "a":
                if (!tetromino.collides(i => ({ x: tetromino.x[i] - 1, y: tetromino.y[i] })))
                    tetromino.update(i => --tetromino.x[i]);
                break;
            case "d":
                if (!tetromino.collides(i => ({ x: tetromino.x[i] + 1, y: tetromino.y[i] })))
                    tetromino.update(i => ++tetromino.x[i]);
                break;
            case "s":
                delay = Tetromino.DELAY / Tetromino.DELAY_INCREASED;
                break;
            case " ":
                tetromino.rotate();
                break;
            case "t":
            case "T":
                isPaused = !isPaused;
                if (!isPaused) {
                    draw();
                }
                break;
        }
    }
    window.onkeyup = event => {
        if (event.key === "s")
            delay = Tetromino.DELAY;
    }
    
    setTimeout(draw, delay);
}

}

        
    
