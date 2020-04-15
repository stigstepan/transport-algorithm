let costs = [];
let needs = [];
let stocks = [];


function calculate () {
    // get value
    trs = $('table tr td').get().map(td => td.innerText);

    let i = 0;
    let j = 0;
    let k = 0;
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
        } else { // cost cell
            costs.push(+trs[s]);
        }
    }


}

function cheapestCost () {

}