
console.log("Starting our panoramic renderer");

// Setup local variables
var scene;
var camera;
var sphere;
var material;
var texLoader;
var mesh;

var longitude = 0;
var latitude  = 0;

var rotationButtonSizeX = window.innerWidth / 8.0;
var rotationButtonSizeY = window.innerHeight / 8.0;
var buttonPressed = false;
var mousePos = new THREE.Vector2(0.0, 0.0);

var useOrientation = false;
var alpha    = 0.0
var beta     = 0.0
var gamma    = 0.0
var gammaCompass  = 0.0
var betaCompass   = 0.0

var pressLeft  = false;
var pressRight = false;
var pressUp    = false;
var pressDown  = false;

var instr1;
var instr2;
var instr3;
var instr4;
var credits;

// Main logic
init();
gameLoop();

function gameLoop() {
    requestAnimationFrame(gameLoop);
    update();
    draw();
}

function init() {
    // Setup renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    instr1 = buildInfoDiv();
    instr2 = buildInfoDiv();
    instr3 = buildInfoDiv();
    instr4 = buildInfoDiv();
    credits = buildInfoDiv();

    instr1.innerHTML = "Visualizador 360°";
    instr1.style.top = 20 + 'px';
    instr1.style.left = 20 + 'px';
    instr1.style.width = window.innerWidth - 20;
    instr1.style.height = 100;

    instr2.innerHTML = "- Mova a câmera livremente com seu dispositivo";
    instr2.style.top = 80 + 'px';
    instr2.style.left = 25 + 'px';
    instr2.style.fontWeight = "normal";
    instr2.style.fontSize = 20 + "px";
    instr2.style.height = 100;

    instr3.innerHTML = "- Use setas do teclado para mover a câmera";
    instr3.style.top = 100 + 'px';
    instr3.style.left = 25 + 'px';
    instr3.style.fontWeight = "normal";
    instr3.style.fontSize = 20 + "px";
    instr3.style.height = 100;

    instr4.innerHTML = "- Toque nas bordas da tela para mover a câmera";
    instr4.style.top = 120 + 'px';
    instr4.style.left = 25 + 'px';
    instr4.style.fontWeight = "normal";
    instr4.style.fontSize = 20 + "px";
    instr4.style.height = 100;

    credits.innerHTML = "Made by Lucas Vieira (luksamuk)";
    credits.style.top = (window.innerHeight - 40) + 'px';
    credits.style.left = 25 + 'px';
    credits.style.fontWeight = "normal";
    credits.style.fontSize = 18 + "px";
    credits.style.height = 100;
 
    document.body.appendChild(instr1);
    document.body.appendChild(instr2);
    document.body.appendChild(instr3);
    document.body.appendChild(instr4);
    document.body.appendChild(credits);

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75,
                        window.innerWidth / window.innerHeight,
                        1.0, 1000.0);
    sphere = new THREE.SphereGeometry(100.0, 100.0, 40);
    material = new THREE.MeshBasicMaterial();
    texLoader = new THREE.TextureLoader();

    camera.target = new THREE.Vector3(0.0, 0.0, 0.0);
    sphere.applyMatrix(new THREE.Matrix4().makeScale(-1.0, 1.0, 1.0));
    material.map = texLoader.load("img.jpg");

    mesh = new THREE.Mesh(sphere, material);
    scene.add(mesh);

    // Mouse listeners
    document.addEventListener("mousedown", onMouseDown, false);
    document.addEventListener("mouseup", onMouseUp, false);
    document.addEventListener("mousemove", onMouseMove, false);
    // Keyboard listeners
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
    // Touch listeners; for debugging only, sorry
    //document.addEventListener("touchstart", onTouch, false);
    //document.addEventListener("touchend", onUnTouch, false);
    // Ignore other touch events
    document.addEventListener("touchmove", function(e){ e.preventDefault(); }, false);
    document.addEventListener("touchenter", function(e){ e.preventDefault(); }, false);
    document.addEventListener("touchleave", function(e){ e.preventDefault(); }, false);
    document.addEventListener("touchcancel", function(e){ e.preventDefault(); }, false);

    // Resize listeners
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("selectstart", function(e){ e.preventDefault(); }, false)

    // Orientation listeners
    if(window.DeviceOrientationEvent) {
        useOrientation = true;
        window.addEventListener("deviceorientation", onOrientationChange, false);
    }
}

function update() {
    // Arrow keys
    if(pressLeft) {
        if(useOrientation){
            longitude = 0.0;
            latitude  = 0.0;
            useOrientation = false;
        }
        longitude -= 0.5;
        console.log("Set stuff");
    }
    if(pressRight) {
        if(useOrientation){
            longitude = 0.0;
            latitude  = 0.0;
            useOrientation = false;
        }
        longitude += 0.5;
    } 
    if(pressUp) {
        if(useOrientation){
            longitude = 0.0;
            latitude  = 0.0;
            useOrientation = false;
        }
        latitude += 0.5;
    } 
    if(pressDown) {
        if(useOrientation){
            longitude = 0.0;
            latitude  = 0.0;
            useOrientation = false;
        }
        latitude -= 0.5;
    }

    // Mouse button
    if(buttonPressed) {
        if(mousePos.x <= rotationButtonSizeX) {
            useOrientation = false;
            longitude -= 0.5;
        }
        else if(mousePos.x >= (window.innerWidth - rotationButtonSizeX)) {
            useOrientation = false;
            longitude += 0.5;
        }

        if(mousePos.y <= rotationButtonSizeY) {
            latitude += 0.5;
        }
        else if(mousePos.y >= (window.innerHeight - rotationButtonSizeY)) {
            useOrientation = false;
            latitude -= 0.5;
        }
    }

    // Phone orientation
    if(useOrientation) {
        getCompass();
        longitude = THREE.Math.radToDeg(gammaCompass * 1.5);
        latitude  = THREE.Math.radToDeg(betaCompass * 1.5);

        // Prevent that NaN nonsense when using a desktop browser
        if(isNaN(latitude) || isNaN(longitude)) {
            longitude = 0.0;
            latitude  = 0.0;
        }
    }

    // Clamp latitude so we don't point at sky or under feet
    latitude = Math.max(-85.0, Math.min(85.0, latitude));

    //console.log("World orientation: {lon " + longitude + ", lat " + latitude + "}");

    // Move camera according to latitude and longitude
    camera.target.x = 500.0 * Math.sin(THREE.Math.degToRad(90.0 - latitude)) * Math.cos(THREE.Math.degToRad(longitude));
    camera.target.y = 500.0 * Math.cos(THREE.Math.degToRad(90.0 - latitude));
    camera.target.z = 500.0 * Math.sin(THREE.Math.degToRad(90.0 - latitude)) * Math.sin(THREE.Math.degToRad(longitude));
    camera.lookAt(camera.target);
}

function draw() {
    renderer.render(scene, camera);
}



function onMouseDown(e) {
    e.preventDefault();
    if(e.which == 1)
        buttonPressed = true;
}

function onMouseUp(e) {
    e.preventDefault();
    if(e.which == 1)
        buttonPressed = false;
}

function onMouseMove(e) {
    e.preventDefault();
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
}

function onKeyDown(e) {
    e.preventDefault();
    console.log("Pressed " + e.keyCode);
    if(e.keyCode == 39)
        pressRight = true;
    else if(e.keyCode == 37)
        pressLeft = true;
    else if(e.keyCode == 38)
        pressUp = true;
    else if(e.keyCode == 40)
        pressDown = true;
}

function onKeyUp(e) {
    e.preventDefault();
    console.log("Unpressed " + e.keyCode);
    if(e.keyCode == 39)
        pressRight = false;
    else if(e.keyCode == 37)
        pressLeft = false;
    else if(e.keyCode == 38)
        pressUp = false;
    else if(e.keyCode == 40)
        pressDown = false;
}

// Touch events for debugging only,
// as they might affect/break the phone
// experience
/*function onTouch(e) {
    e.preventDefault();
    var touchObj = e.changedTouches[0];
    mousePos.x = touchObj.clientX;
    mousePos.y = touchObj.clientY;
    buttonPressed = true;
}

function onUnTouch(e) {
    e.preventDefault();
    var touchObj = e.changedTouches[0];
    mousePos.x = touchObj.clientX;
    mousePos.y = touchObj.clientY;
    buttonPressed = false;
}*/

function onOrientationChange(e) {
    e.preventDefault();
    alpha    = e.alpha;
    beta     = e.beta;
    gamma    = e.gamma;
}

function onWindowResize(e) {
    console.log("Resized screen");
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera = new THREE.PerspectiveCamera(75,
                        window.innerWidth / window.innerHeight,
                        1.0, 1000.0);
    camera.target = new THREE.Vector3(0.0, 0.0, 0.0);
    rotationButtonSizeX = window.innerWidth / 8.0;
    rotationButtonSizeY = window.innerHeight / 8.0;
    instr1.style.width = window.innerWidth - 20;
    credits.style.top = (window.innerHeight - 20) + 'px';
}

function getCompass() {
    var alphaRad = THREE.Math.degToRad(alpha);
    var betaRad  = THREE.Math.degToRad(beta);
    var gammaRad = THREE.Math.degToRad(gamma);

    var cosAlpha = Math.cos(alphaRad);
    var sinAlpha = Math.sin(alphaRad);
    var cosBeta = Math.cos(betaRad);
    var sinBeta = Math.sin(betaRad);
    var cosGamma = Math.cos(gammaRad);
    var sinGamma = Math.sin(gammaRad);

    var rotA = (-cosAlpha * sinGamma) - (sinAlpha * sinBeta * cosGamma);
    var rotB = (-sinAlpha * sinGamma) + (cosAlpha * sinBeta * cosGamma);
    var rotC = -cosBeta * cosGamma;


    // "gamma" compass
    gammaCompass = Math.atan(rotA / rotB);
    gammaCompass += (rotB < 0) ? Math.PI : ((rotA < 0) ? 2.0 * Math.PI : 0.0);

    // "beta" compass
    betaCompass  = -Math.atan(-rotC);
}

function buildInfoDiv() {
    var myDiv = document.createElement("div");
    myDiv.style.pointerEvents = "none";
    myDiv.style.position = "absolute";
    myDiv.style.textShadow = "1px 1px #000";
    myDiv.style.fontWeight = "bold";
    myDiv.style.fontSize = 48 + "px";
    //myDiv.style.zIndex = 1;
    myDiv.style.color = "white";
    myDiv.innerHTML = ".innerHTML";
    myDiv.style.top = 20 + 'px';
    myDiv.style.left = 20 + 'px';
    return myDiv;
}