alert("Users can edit any content in this page. Use wisely. For optimal experience, increase the volume, view the page on large screens. UNDER CONSTRUCTION: inf and STOP movements");
document.getElementById("toggleInstructions").addEventListener("click", () => {
  const box = document.getElementById("instructionsBox");
  box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
});
const robot = document.querySelector(".robot-body");
const workstationInput = document.querySelector("#workstation-form #workstation-input");
const workstationStatus = document.getElementById("workstation-status");
let posX = 0, posY = 0, rotation = 0;
updateRobot();
let speed = 13;
let turboMultiplier = 2;
let moveInterval = null;
let infiniteMoveInterval = null;
window.addEventListener("keydown", (e) => {
  if (e.key === "F5" || (e.ctrlKey && e.key.toLowerCase() === "r") || (e.ctrlKey && e.altKey && e.key.toLowerCase() === "r")) {
    e.preventDefault();
    alert("Reload is disabled! Use the browser reload button instead.");
  }
});
function resetPosition() {
  posX = 0; posY = 0; rotation = 0;
  updateRobot();
  workstationStatus.textContent = "Robot reset to origin.";
}
robot.style.transition = "transform 0.6s ease-in-out";
function updateRobot() {
  robot.style.transform = `rotate(${rotation}deg) translate(${posX}px, ${posY}px)`;
}
function startInfiniteMove(direction, turbo = false) {
  stopInfiniteMove();
  const spd = turbo ? speed * turboMultiplier : speed;
  function animate() {
    switch(direction) {
      case "UP": posY -= step; break; case "DN": posY += step; break; case "LF": posX -= step; break; case "RT": posX += step; break;
    }
    updateRobot();
    infiniteMoveInterval = requestAnimationFrame(animate);
  }
  animate();
}
function stopInfiniteMove() {
  if (moveInterval) {clearInterval(moveInterval); moveInterval = null;}
  if (infiniteMoveInterval) {cancelAnimationFrame(infiniteMoveInterval); infiniteMoveInterval = null;}
}
function moveRobot(direction, distance, turbo = false, rotate = false, rotateDir = null) {
  stopInfiniteMove();
  const actualSpeed = turbo ? speed * turboMultiplier : speed;
  const moveStep = distance * actualSpeed;
  robot.style.transition = turbo ? "transform 0.5s ease-in-out" : "transform 0.8s ease-in-out";
  if (!rotate) {
    switch (direction) {
      case "UP": posY -= moveStep; break; case "DN": posY += moveStep; break; case "LF": posX -= moveStep; break; case "RT": posX += moveStep; break;
    }
  } else {
    const angleChange = rotateDir === "RT" ? 15 * distance : -15 * distance;
    rotation += angleChange;
    switch (direction) {case "UP": posY -= moveStep; break; case "DN": posY += moveStep; break;}
  }
  updateRobot();
}
function rotateRobot(dir, distance, turbo = false) {
  robot.style.transition = "transform 0.6s ease-in-out";
  const rotateStep = distance * (turbo ? 2 * turboMultiplier : 2);
  rotation += dir === "RT" ? rotateStep : -rotateStep;
  updateRobot();
}
function executeCommand(cmd) {
  if (!cmd.trim()) return;
    if(cmd==="HELO"){
      isActivated=true;
      const text="Executed: Hello! I am Codex Robot! Your Low Code Moving Robot Web Application! Follow the Robot Workstation Instructions for Further Assistance!";
      workstationStatus.textContent=text;
      speak(text);
      return;
    }
    if(cmd==="GOODBYE"){
      isActivated=false;
      const text="Good Bye!";
      workstationStatus.textContent=text;
      speak(text);
      return;
    }
    if(!isActivated){workstationStatus.textContent="Invalid syntax (case mismatch)."; return;}
  if (cmd.startsWith("SPD ")) {
    const val = cmd.split(" ")[1];
    if (val === "RESET") {
      speed = 13;
      const t="Executed: Speed reset to default.";
      workstationStatus.textContent=t;
      speak(t);
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) {
      speed = num;
      const t=`Executed: Speed set to ${num}`;
      workstationStatus.textContent=t;
      speak(t);
      return;
    }
    workstationStatus.textContent="Invalid speed command.";
    return;
  }
  if (cmd.includes("/NBR")) {
    const commandQueue = cmd.split("/NBR").map(c => c.trim()).filter(c => c.length > 0);
    let delay = 0;
    const baseDelay = 900;
    commandQueue.forEach((subCmd, index) => {
      setTimeout(() => executeCommand(subCmd), delay);
      delay += baseDelay;
    });
    workstationStatus.textContent = "Executing multiple commands (NBR mode)...";
    return;
  }
  if (cmd !== cmd.toUpperCase() && !cmd.includes("(inf)")) {alert("Undefined Command! Please read the instructions carefully!");
    workstationStatus.textContent = "Invalid syntax (case mismatch)."; return;}
  if (cmd === "STOP") {stopInfiniteMove(); workstationStatus.textContent = "All infinite movements stopped."; return;}
  if (cmd === "MOV ORG") {resetPosition(); return;}
  const movPattern = /^(MOV|TRB)\s+(ROT\s+)?(UP|DN|LF|RT)\s*(?:([LR]F|[LR]T))?\((\d+|inf)\)$/;
  const rotPattern = /^(ROT|TROT)\s+(LF|RT)\((\d+|inf)\)$/;
  let match;
  if ((match = cmd.match(movPattern))) {
    const [, mode, isRot, direction, rotDir, stepsRaw] = match;
    const turbo = mode === "TRB";
    const steps = stepsRaw === "inf" ? Infinity : parseInt(stepsRaw);
        if (steps === Infinity) {startInfiniteMove(direction, turbo, !!isRot, rotDir);} 
        else {moveRobot(direction, steps, turbo, !!isRot, rotDir);}
  const spokenText = `Executed: ${cmd}`;
  workstationStatus.textContent = spokenText;
  speak(spokenText);
    return;
  } 
  if ((match = cmd.match(rotPattern))) {
    const [, mode, direction, stepsRaw] = match;
    const turbo = mode === "TROT";
    const steps = stepsRaw === "inf" ? Infinity : parseInt(stepsRaw);
    if (steps === Infinity) {stopInfiniteMove(); moveInterval = setInterval(() => rotateRobot(direction, 1, turbo), 100);
    } else {rotateRobot(direction, steps, turbo);}
    const spokenText = `Executed: ${cmd}`;
    workstationStatus.textContent = spokenText;
    speak(spokenText);
  } 
  else {workstationStatus.textContent = "Invalid command";}
}
workstationInput.addEventListener("input", () => {
  if (workstationInput.value.includes("/NBR")) {
    workstationInput.value = workstationInput.value.replace(/\/NBR/g, "\n");
  }
});
workstationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const commands = workstationInput.value
      .split("\n")
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    let delay = 0;
    const baseDelay = 900;
    commands.forEach(cmd => {setTimeout(() => executeCommand(cmd), delay); delay += baseDelay;});
    workstationInput.value = "";
  }
});
function speak(text) {const utterance = new SpeechSynthesisUtterance(text); 
  utterance.rate = 1; utterance.pitch = 1; utterance.volume = 1;
  speechSynthesis.speak(utterance);}
