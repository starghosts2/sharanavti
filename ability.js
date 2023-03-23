"use strict";
// NOTE: This is just test code, it is super messy!
const PIOver180 = Math.PI / 180;
function getRadian(degree) {
    return degree * PIOver180;
}
function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = getRadian(angleInDegrees - 90);
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
function describeArc(x, y, radius, startAngle, endAngle) {
    // to cope with 360 === 0
    var usingEndAngle = endAngle - 0.0001;
    var start = polarToCartesian(x, y, radius, usingEndAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = usingEndAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
}
function createSVGElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function createSVGRing(svg, className, x, y, radius, angle) {
    const strokeWidth = '3px';
    const arc = describeArc(x, y, radius, 0, angle);
    const glowPath = createSVGElement('path');
    glowPath.setAttribute('d', arc);
    glowPath.setAttribute('fill', 'none');
    glowPath.setAttribute('stroke-width', strokeWidth);
    glowPath.setAttribute('class', className + '-blur');
    svg.appendChild(glowPath);
    const path = createSVGElement('path');
    path.setAttribute('d', arc);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', strokeWidth);
    path.setAttribute('class', className);
    svg.appendChild(path);
}
function drawButton(button, innerPercent, outerPercent) {
    const svg = createSVGElement('svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    const x = 35;
    const y = 35;
    const innerRadius = 26;
    const outerRadius = 29;
    // outer bg
    createSVGRing(svg, 'outer-bg', x, y, outerRadius, 360);
    // outer color
    createSVGRing(svg, 'outer', x, y, outerRadius, outerPercent);
    // inner bg
    createSVGRing(svg, 'inner-bg', x, y, innerRadius, 360);
    // inner top
    createSVGRing(svg, 'inner', x, y, innerRadius, innerPercent);
    // clear element and set
    button.innerHTML = '';
    button.appendChild(svg);
}
function handleTimer(element, currentTime, totalTime) {
    const remaining = (totalTime - currentTime) / 1000;
    if (remaining < 10) {
        element.setAttribute('data-timer', remaining.toFixed(1));
    }
    else {
        element.setAttribute('data-timer', Math.ceil(remaining) + '');
    }
}
function onBeginCast(element) {
    drawButton(element, 0, 360);
    element.classList.add('startCast');
    setTimeout(() => {
        element.classList.remove('startCast');
        drawButton(element, 0, 0);
        //doCast(element, 4, 0);
    }, 500);
}
function onError(element) {
    drawButton(element, 360, 0);
    element.classList.add('error');
    setTimeout(() => {
        element.classList.remove('error');
        drawButton(element, 0, 0);
    }, 500);
}
function getAngle(percent) {
    return 360 * percent;
}
function runPrep(element, className, currentTime, totalTime, intervalMS, reverse, onCompleted) {
    element.classList.add(className);
    drawButton(element, reverse ? 360 - getAngle(currentTime / totalTime) : getAngle(currentTime / totalTime), 0);
    handleTimer(element, currentTime, totalTime);
    if (currentTime >= totalTime) {
        element.classList.remove(className);
        onCompleted();
        return;
    }
    if (currentTime + intervalMS > totalTime) {
        setTimeout(() => runPrep(element, className, totalTime, totalTime, intervalMS, reverse, onCompleted), totalTime - currentTime);
    }
    else {
        setTimeout(() => runPrep(element, className, currentTime + intervalMS, totalTime, intervalMS, reverse, onCompleted), intervalMS);
    }
}
function runCooldown(element, currentTime, totalTime, intervalMS, onCompleted) {
    element.classList.add('cooldown');
    drawButton(element, 360 - getAngle(currentTime / totalTime), 0);
    handleTimer(element, currentTime, totalTime);
    if (currentTime >= totalTime) {
        element.classList.remove('cooldown');
        onCompleted();
        return;
    }
    if (currentTime + intervalMS > totalTime) {
        setTimeout(() => runCooldown(element, totalTime, totalTime, intervalMS, onCompleted), totalTime - currentTime);
    }
    else {
        setTimeout(() => runCooldown(element, currentTime + intervalMS, totalTime, intervalMS, onCompleted), intervalMS);
    }
}
function runPrepWithDisruption(element, currentTime, totalTime, intervalMS, disruptionDamageTaken, disruptionHealth, onCompleted) {
    element.classList.add('prep');
    if (getRandomBetween(0, 10) > 5) {
        disruptionDamageTaken += getRandomBetween(10, 450);
    }
    drawButton(element, getAngle(currentTime / totalTime), getAngle(disruptionDamageTaken / disruptionHealth));
    handleTimer(element, currentTime, totalTime);
    if (disruptionDamageTaken >= disruptionHealth) {
        // interrupted!
        element.classList.add('interrupted');
        runPrep(element, 'prep', 0, 500, 50, true, () => {
            element.classList.remove('interrupted');
            onCompleted(disruptionDamageTaken);
        });
        return;
    }
    if (currentTime >= totalTime) {
        element.classList.remove('prep');
        onCompleted(disruptionDamageTaken);
        return;
    }
    if (currentTime + intervalMS > totalTime) {
        setTimeout(() => runPrepWithDisruption(element, totalTime, totalTime, intervalMS, disruptionDamageTaken, disruptionHealth, onCompleted), totalTime - currentTime);
    }
    else {
        setTimeout(() => runPrepWithDisruption(element, currentTime + intervalMS, totalTime, intervalMS, disruptionDamageTaken, disruptionHealth, onCompleted), intervalMS);
    }
}
function runChannelWithDisruption(element, currentTime, totalTime, intervalMS, disruptionDamageTaken, disruptionHealth, onCompleted) {
    element.classList.add('channel');
    if (getRandomBetween(0, 10) > 5) {
        disruptionDamageTaken += getRandomBetween(10, 450);
    }
    drawButton(element, getAngle(currentTime / totalTime), getAngle(disruptionDamageTaken / disruptionHealth));
    if (disruptionDamageTaken >= disruptionHealth) {
        element.classList.remove('channel');
        // interrupted!
        element.classList.add('interrupted');
        runPrep(element, 'prep', 0, 500, 50, true, () => {
            element.classList.remove('interrupted');
            onCompleted(disruptionDamageTaken);
        });
        return;
    }
    if (currentTime >= totalTime) {
        element.classList.remove('channel');
        onCompleted(disruptionDamageTaken);
        return;
    }
    if (currentTime + intervalMS > totalTime) {
        setTimeout(() => runChannelWithDisruption(element, totalTime, totalTime, intervalMS, disruptionDamageTaken, disruptionHealth, onCompleted), totalTime - currentTime);
    }
    else {
        setTimeout(() => runChannelWithDisruption(element, currentTime + intervalMS, totalTime, intervalMS, disruptionDamageTaken, disruptionHealth, onCompleted), intervalMS);
    }
}
function runStartCast(element, onCompleted) {
    element.classList.add('startCast');
    drawButton(element, 0, 360);
    setTimeout(() => {
        element.classList.remove('startCast');
        onCompleted();
    }, 500);
}
function runFullWithDisruption(element, disruptionDamageTaken, disruptionHealth, onCompleted) {
    runStartCast(element, () => {
        runPrepWithDisruption(element, 0, 5000, 50, disruptionDamageTaken, disruptionHealth, taken => {
            if (taken >= disruptionHealth) {
                // we were interrupted -- go to coooldown
                runCooldown(element, 0, 5000, 50, () => onCompleted());
                return;
            }
            element.classList.add('hit');
            drawButton(element, 360, 360);
            setTimeout(() => {
                element.classList.remove('hit');
                runChannelWithDisruption(element, 0, 5000, 50, taken, disruptionHealth, taken2 => {
                    if (taken2 >= disruptionHealth) {
                        // we were interrupted -- go to coooldown
                        runCooldown(element, 0, 5000, 50, () => onCompleted());
                        return;
                    }
                    runPrep(element, 'recovery', 0, 3000, 50, true, () => {
                        runCooldown(element, 0, 5000, 50, () => onCompleted());
                    });
                });
            }, 250);
        });
    });
}
function loopHit(element) {
    element.classList.add('hit');
    setTimeout(() => {
        element.classList.remove('hit');
        setTimeout(() => loopHit(element), 1000);
    }, 250);
}
function loopCooldown(element) {
    runCooldown(element, 0, 15000, 50, () => {
        setTimeout(() => loopCooldown(element), 500);
    });
}
function loopPrep(element) {
    runPrep(element, 'prep', 0, 5000, 50, false, () => {
        setTimeout(() => loopPrep(element), 500);
    });
}
function loopChannel(element) {
    runPrep(element, 'channel', 0, 10000, 50, false, () => {
        setTimeout(() => loopChannel(element), 500);
    });
}
function loopRecovery(element) {
    runPrep(element, 'recovery', 0, 5000, 50, true, () => {
        setTimeout(() => loopRecovery(element), 500);
    });
}
function loopPrepAndDisrupt(element) {
    runPrepWithDisruption(element, 0, 5000, 50, 0, 10000, () => {
        runCooldown(element, 0, 5000, 50, () => setTimeout(() => loopPrepAndDisrupt(element), 500));
    });
}
function loopFullCast(element) {
    // click
    drawButton(element, 0, 360);
    element.classList.add('startCast');
    setTimeout(() => {
        element.classList.remove('startCast');
        // prep
        runPrep(element, 'prep', 0, 3000, 50, false, () => {
            drawButton(element, 0, 360);
            element.classList.add('hit');
            setTimeout(() => {
                element.classList.remove('hit');
                // channel
                runPrep(element, 'channel', 0, 5000, 50, true, () => {
                    // recovery
                    runPrep(element, 'recovery', 0, 3000, 50, true, () => {
                        // cooldown
                        runCooldown(element, 0, 5000, 50, () => {
                            // looooooop
                            setTimeout(() => loopFullCast(element), 500);
                        });
                    });
                });
            }, 250);
        });
    }, 500);
}
function loopFullCastWithDisruption(element) {
    runFullWithDisruption(element, 0, 25000, () => {
        setTimeout(() => loopFullCastWithDisruption(element), 1000);
    });
}
/////////////////////////////////////////////////////////
/// INTERACTIVE BUTTON METHODS
function tryLock(butn) {
    if (interactiveLock)
        return false;
    interactiveLock = true;
    return true;
}
function resetInteractive(butn) {
    butn.className = 'skillbutton ready';
    drawButton(butn, 0, 0);
    interactiveLock = false;
}
function doClick(butn) {
    if (!tryLock())
        return;
    drawButton(butn, 0, 360);
    butn.classList.add('startCast');
    setTimeout(() => {
        butn.classList.remove('startCast');
        resetInteractive(butn);
    }, 500);
}
function doPrep(butn,time) {
    if (!tryLock())
        return;
    runPrep(butn, 'prep', 0, time, 50, false, () => {
        resetInteractive(butn);
    });
}
function doRecovery(butn,time) {
    if (!tryLock())
        return;
    runPrep(butn, 'recovery', 0, time, 50, true, () => {
        resetInteractive(butn);
    });
}
function doQueue(butn,time) {
    if (!tryLock())
        return;
    butn.classList.add('queued');
    drawButton(butn, 360, 360);
    setTimeout(() => {
        resetInteractive(butn);
    }, time);
}
function doError(butn) {
    if (!tryLock())
        return;
    drawButton(butn, 360, 0);
    butn.classList.add('error');
    setTimeout(() => {
        butn.classList.remove('error');
        resetInteractive(butn);
    }, 500);
}
function doCooldown(butn,time) {
    if (!tryLock())
        return;
    runCooldown(butn, 0, time, 50, () => {
        resetInteractive(butn);
    });
}
function doPrepWithDisruption(butn,time,time2) {
    if (!tryLock())
        return;
    runPrepWithDisruption(butn, 0, time, 50, 0, time2, () => {
        resetInteractive(butn);
    });
}
function doHit(butn) {
    if (!tryLock())
        return;
    drawButton(butn, 0, 360);
    butn.classList.add('hit');
    setTimeout(() => {
        butn.classList.remove('hit');
        resetInteractive(butn);
    }, 250);
}
/////////////////////////////////////////////////////////
/// INIT
function initSkillBar(div) {
    // add a single svg element for blur effects
    const svg = createSVGElement('svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    const blur = createSVGElement('feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '1');
    const filter = createSVGElement('filter');
    filter.setAttribute('x', '-2');
    filter.setAttribute('y', '-2');
    filter.setAttribute('width', '1000');
    filter.setAttribute('height', '1000');
    filter.setAttribute('id', 'svg-blur');
    filter.appendChild(blur);
    svg.appendChild(filter);
    div.appendChild(svg);
    // render buttons initial settings
    interactive = document.getElementById('interactive');
    drawButton(interactive, 0, 0);
	interactive2 = document.getElementById('interactive2');
    drawButton(interactive2, 0, 0);
	interactive3 = document.getElementById('interactive3');
    drawButton(interactive3, 0, 0);
    const ready = document.getElementById('ready');
    drawButton(ready, 360, 360);
    const noammo = document.getElementById('noammo');
    drawButton(noammo, 0, 0);
    const noweapon = document.getElementById('noweapon');
    drawButton(noweapon, 0, 0);
    const prep = document.getElementById('prep');
    drawButton(prep, 0, 0);
    const recovery = document.getElementById('recovery');
    drawButton(recovery, 0, 0);
    const queued = document.getElementById('queued');
    drawButton(queued, 360, 360);
    const cooldown = document.getElementById('cooldown');
    drawButton(cooldown, 0, 0);
    const disrupt = document.getElementById('disrupt');
    drawButton(disrupt, 0, 0);
    const full = document.getElementById('full');
    drawButton(full, 0, 0);
    const fullwithdisruption = document.getElementById('fullwithdisruption');
    drawButton(fullwithdisruption, 0, 0);
    const hit = document.getElementById('hit');
    drawButton(hit, 0, 360);
    const channel = document.getElementById('channel');
    drawButton(channel, 0, 0);
    const hold = document.getElementById('hold');
    drawButton(hold, 360, 0);
    const unavailable = document.getElementById('unavailable');
    drawButton(unavailable, 360, 360);
    const modal = document.getElementById('modal');
    drawButton(modal, 360, 360);
    // run prep on loop
    loopPrep(prep);
    // run recovery on loop
    loopRecovery(recovery);
    // run cooldown on loop
    loopCooldown(cooldown);
    // run prep and disrupt on loop
    loopPrepAndDisrupt(disrupt);
    // loop da full cast
    loopFullCast(full);
    loopHit(hit);
    loopChannel(channel);
    loopFullCastWithDisruption(fullwithdisruption);
    // init mouse events.
    ready.addEventListener('click', () => onBeginCast(ready));
    // error click handlers
    noammo.addEventListener('click', () => onError(noammo));
    noweapon.addEventListener('click', () => onError(noweapon));
    unavailable.addEventListener('click', () => onError(unavailable));
}
let interactive = null;
let interactiveLock = false;
initSkillBar(document.getElementById('skills'));