let coasts = [];
let needs = [];
let stocks = [];


function calculate () {
    coasts = [];
    needs = [];
    stocks = [];
    // get value
    trs = $('table tr td').get().map(td => td.innerText);

    let i = 0;
    let j = 0;
    let k = 0;
    let tmpcoasts = [];
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
            tmpcoasts.push(+trs[s]);
        }
    }

    let row = [];
    for (i = 0; i < tmpcoasts.length; i++) {
        row.push(tmpcoasts[i]);
        
        if ((i+1) % (j-2) == 0) {
            coasts.push(row);
            row = [];
        }
    }


    console.log('Стоимость: ' + cheapestCoast());
}

function cheapestCoast () {
    let end = false;
    let resCoast = 0;
    let minVl = 0;

    while (!end) {
        let [i, j] = findMinCoast();

        minVl = (needs[j] < stocks[i]) ? needs[j] : stocks[i];
        resCoast += minVl * coasts[i][j];
        coasts[i][j] = NaN;
        needs[j] -= minVl;
        stocks[i] -= minVl;

        end = checkEnd();
    }
    return resCoast;
}

function findMinCoast () {
    let minI = minJ = 1000, minCoast = 9999999;
    for (let i = 0; i < coasts.length; i++) {
        for (let j = 0; j < coasts[i].length; j++) {
            if(!Number.isNaN(coasts[i][j]) && coasts[i][j] < minCoast && coasts[i][j] != 0) {
                minI = i;
                minJ = j;
                minCoast = coasts[i][j];
            }
        }
    }
    if(minI == 1000 || minJ == 1000) {
        for (let i = 0; i < coasts.length; i++) {
            for (let j = 0; j < coasts[i].length; j++) {
                if(!Number.isNaN(coasts[i][j]) && coasts[i][j] < minCoast) {
                    minI = i;
                    minJ = j;
                    minCoast = coasts[i][j];
                }
            }
        }
    }
    return [minI, minJ];
}

function checkEnd () {
    let res = true;
    needs.forEach(function (need) {
        if (need != 0) { res = false; }
    });
    stocks.forEach(function (stock) {
        if (stock != 0) { res = false; }
    });
    return res;
}