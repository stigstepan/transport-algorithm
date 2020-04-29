


function calculate () {
    let coasts = [];
    let needs = [];
    let stocks = [];
    let referencePlan = []
    // get value
    trs = $('table tr td').get().map(td => td.innerText);

    let i = 0;
    let j = 0;
    let k = 0;
    let strCoasts = [];
    for (let s = 0; s < trs.length; s++) {
        if(k == 0) {
            j++;
            if (trs[s] == 'Запасы') {
                k++;
            }
            continue;
        }
        i = s % j;
        if (i == 0) { continue; } // first column
        if (k == j - 1) { // last row
            (i != j-1) && needs.push(+trs[s]);
        } else if (i == j-1) { // last column
            stocks.push(+trs[s]);
            k++;
        } else { // coast cell
            strCoasts.push(+trs[s]);
        }
    }

    let row = [];
    for (i = 0; i < strCoasts.length; i++) {
        row.push(strCoasts[i]);
        
        if ((i+1) % (j-2) == 0) {
            coasts.push(row);
            referencePlan.push(new Array(row.length));
            row = [];
        }
    }

    northWest(coasts, needs, stocks); // calculate by North-West methods
    cheapestCoast(coasts, needs, stocks, referencePlan); // calculate by cheapest coast method, and initialize referencePlan
    potentials(coasts, needs, stocks, referencePlan); // check referencePlan by method of potentials
}

function cheapestCoast (coasts, needs, stocks, referencePlan) {
    let end = false;
    let resCoast = 0;
    let minVl = 0;
    let coastsCopy = JSON.parse(JSON.stringify(coasts));
    let needsCopy = JSON.parse(JSON.stringify(needs));
    let stocksCopy = JSON.parse(JSON.stringify(stocks));

    while (!end) {
        let [i, j] = findMinCoast(coastsCopy);

        minVl = (needsCopy[j] < stocksCopy[i]) ? needsCopy[j] : stocksCopy[i];
        resCoast += minVl * coastsCopy[i][j];
        referencePlan[i][j] = minVl || undefined;
        coastsCopy[i][j] = NaN;
        needsCopy[j] -= minVl;
        stocksCopy[i] -= minVl;

        end = checkEnd(needsCopy, stocksCopy);
    }

    $('#cheapestCoastResultField').attr('value', 'Стоимость: ' + resCoast);
    return resCoast;
}

function findMinCoast (coastsCopy) {
    let minI = minJ = 1000, minCoast = 9999999;
    for (let i = 0; i < coastsCopy.length; i++) {
        for (let j = 0; j < coastsCopy[i].length; j++) {
            if(!Number.isNaN(coastsCopy[i][j]) && coastsCopy[i][j] < minCoast && coastsCopy[i][j] != 0) {
                minI = i;
                minJ = j;
                minCoast = coastsCopy[i][j];
            }
        }
    }
    if(minI == 1000 || minJ == 1000) {
        for (let i = 0; i < coastsCopy.length; i++) {
            for (let j = 0; j < coastsCopy[i].length; j++) {
                if(!Number.isNaN(coastsCopy[i][j]) && coastsCopy[i][j] < minCoast) {
                    minI = i;
                    minJ = j;
                    minCoast = coastsCopy[i][j];
                }
            }
        }
    }
    return [minI, minJ];
}

function checkEnd (needs, stocks) {
    let res = true;
    needs.forEach(function (need) {
        if (need != 0) { res = false; }
    });
    stocks.forEach(function (stock) {
        if (stock != 0) { res = false; }
    });
    return res;
}

function northWest (coasts, needs, stocks) {
    let resCoast = 0;
    let minVl = 0;
    let coastsCopy = JSON.parse(JSON.stringify(coasts));
    let needsCopy = JSON.parse(JSON.stringify(needs));
    let stocksCopy = JSON.parse(JSON.stringify(stocks));

    for (let i = 0, j = 0; i < coastsCopy.length && j < coastsCopy[i].length;) { // step i then step j
            
        coast = coastsCopy[i][j];
        const nextJStep = (needsCopy[j] < stocksCopy[i]);

        minVl = (needsCopy[j] < stocksCopy[i]) ? needsCopy[j] : stocksCopy[i];
        resCoast += minVl * coastsCopy[i][j];
        coastsCopy[i][j] = NaN;
        needsCopy[j] -= minVl;
        stocksCopy[i] -= minVl;

        if (nextJStep) {
            j++;
        } else {
            i++;
        }
    }

    $('#northWestResultField').attr('value', 'Стоимость: ' + resCoast);
    return resCoast;
}

function potentials (coasts, needs, stocks, referencePlan) {
    let end = false;
    let resCoast = 0;
    let referencePlanCopy = JSON.parse(JSON.stringify(referencePlan));
    let coastsCopy = JSON.parse(JSON.stringify(coasts));
    let estimates = new Array(coasts.length);
    for (let i = 0; i < estimates.length; i++) {
        estimates[i] = new Array(coasts.length);
    }
    // let needsCopy = JSON.parse(JSON.stringify(needs));
    // let stocksCopy = JSON.parse(JSON.stringify(stocks));

    while (!end) {
        let potentials = getPotentials(coastsCopy, referencePlanCopy)

        end = checkEstimatesIdleRoutes(coastsCopy, referencePlanCopy, potentials, estimates);

        let {minI, minJ} = findMinEstimate(estimates);

        if (!end) {
            goCycle(minI, minJ, referencePlanCopy);
        }
    }

    resCoast = getCoast(coastsCopy, referencePlanCopy);

    $('#potentioalsResultField').attr('value', 'Стоимость: ' + resCoast);
    return resCoast;
}

function getPotentials (coasts, referencePlan) {
    let pNeeds = new Array(coasts.length);
    let pStocks = new Array(coasts.length);
    
    pNeeds[0] = 0;

    for (let i = 0; i < coasts.length; i++) {
        for (let j = 0; j < coasts.length; j++) {
            if (referencePlan[i][j] == undefined) { continue; }
            if (pNeeds[j] != undefined) {
                pStocks[i] = coasts[i][j] - pNeeds[j];
            } else if (pStocks[i] != undefined) {
                pNeeds[j] = coasts[i][j] - pStocks[i];
            }
        }
    }

    return {needs: pNeeds, stocks: pStocks};
}

function checkEstimatesIdleRoutes (coasts, referencePlan, potentials, estimates) {
    let end = true;
    let pots = 0;
    let res = 0;
    for (let i = 0; i < coasts.length; i++) {
        for (let j = 0; j < coasts.length; j++) {
            if (referencePlan[i][j]) { continue; }

            pots = potentials.needs[j] + potentials.stocks[i];
            res = coasts[i][j] - pots;
            estimates[i][j] = res;
            
            if (res < 0) {
                end = false;
            }
        }
    }

    return end;
}

function getCoast (coasts, referencePlan) {
    let res = 0;

    for (let i = 0; i < coasts.length; i++) {
        for (let j = 0; j < coasts.length; j++) {
            if(!referencePlan[i][j]) { continue; }
            res += coasts[i][j] * referencePlan[i][j];
        }
    }

    return res;
}

function findMinEstimate (estimates) {
    let minI = minJ = 0, minEstimate = 9999999;
    for (let i = 0; i < estimates.length; i++) {
        for (let j = 0; j < estimates[i].length; j++) {
            if (estimates[i][j] && estimates[i][j] < minEstimate) {
                minI = i;
                minJ = j;
                minEstimate = estimates[i][j];
            }
        }
    }
    return [minI, minJ];
}

function goCycle (startI, startJ, referencePlan) {
    let curentI = startI;
    let curentJ = startJ;
    let prevI = curentI, prevJ = curentJ;
    let passedPoint = []; 
    do {
        for (let i = 0; i < referencePlan.length; i++) {
            if(passedPoint.includes)
            if (referencePlan[i][curentJ]) {
                curentI = i;
            }
        }
        
    } while (curentI != startI && curentJ != startJ)

}