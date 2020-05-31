export let getHBarData = (totalIncome, totalExpenses) => {
    let hBarData = [];
    if(totalIncome === 0 && totalExpenses === 0) {
        return hBarData;
    }
    // 3/24/20 - If data is not available, NaN is beign assigned and the HorizontalBarChart.js is failing to show the data
    // if data is not available, value is defaulted to zero
    hBarData.push({label : 'Income', value : (totalIncome) ? totalIncome: 0});
    hBarData.push({label : 'Expense', value : (totalExpenses) ? totalExpenses : 0});
    return hBarData;
}

export let parseDate = (date) => {
    let useDefault = false;
    if(!date) {
        date = new Date();
        useDefault = true;
    }
    
    if(!useDefault) {
        var parts = date.match(/(\d+)/g);
        return (parts[0]+'-'+parts[1]+'-'+parts[2]);
    } else {
        let month = date.getMonth() >= 0 && date.getMonth() <= 9 ? '0'+(date.getMonth()+1) : date.getMonth()+1;
        return date.getFullYear()+'-'+month+'-'+(date.getDate() > 0 && date.getDate() <= 9 ? '0'+date.getDate(): date.getDate());
    }
}

export let getMonth = (date) => {
    var parts = date.match(/(\d+)/g);
    return parseInt(parts[1]);
}

export let getCurrentYear = () => {
    return new Date().getFullYear();
}

/**
 * to aggregate (SUM) amount
 * 2/22/2020 - Modified to use convAmount for amount aggregation - Multi-Currency implementation
 * @param  {} data
 */
export let calculateTotalAmount = (data) => {
    let totalAmount = 0;
    for (let d of data) {
        totalAmount += d.convAmount;
    }
    return Math.round(totalAmount * 100) / 100;
}

/**
 * to get the system time
 */
export let getSystemTime = () => {
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()+'.000z';
    return (parseDate()+'T'+time);
}

/**
 * Convert the amount from expData to the propsCurrency.
 * Using the exchange rates available in expData
 * converted amount is stored as convAmount
 * converted currency is stored as convCurrency
 * @param  {} expData
 * @param  {} propsCurrency
 */
export let convertCurrency = (expData, propsCurrency) => {
    if(expData.rates && expData.rates[propsCurrency]) {
        if(expData.amount) {
            expData.convAmount = parseInt((expData.amount * expData.rates[propsCurrency]).toFixed(3));
        } else if(expData.value) {
            expData.convAmount = parseInt((expData.value * expData.rates[propsCurrency]).toFixed(3));
        }
        expData.convCurrency = propsCurrency;
    } else {
        if(expData.amount) {
            expData.convAmount = expData.amount;
        } else if(expData.value) {
            expData.convAmount = expData.value;
        }
        expData.convCurrency = expData.currency;
    }
    return expData;
}

/**
 * This function is used to segregate the Income/Expense Data based on the selected month
 * and segType
 * @param {Array} data - Income/Expense Data
 * @param {Array} months - Months from the config file
 * @param {String} selectedMonth - Selected month
 * @param {String} type - Segregation Type (optional)
 * Available options: category, sub_category, income_type
 * @param {String} segType - List of values invloved in the segregation based on Type
 * @param {String} propsCurrency - Selected currency from NavBar
 */
export let segregateDataByType = (data, months, selectedMonth, type, segType, propsCurrency) => {
    let displayedData = [];
    const monthsMap = new Map(Object.entries(months));
    if(!segType) {
        if (selectedMonth.toLowerCase() === 'all') {
            return data;
        }

        for (let i = 0; i < data.length; i++) {
            if (getMonth(data[i].date) === monthsMap.get(selectedMonth)) {
                displayedData.push(data[i]);
            }
        }
    } else {
        if (selectedMonth.toLowerCase() === 'all') {
            for (let cat of segType) {
                let dataTemp = {
                    label: cat
                }
                let total = 0;
                for (let d of data) {
                    if (d[type] === cat) {
                        // 3/24/20 - calling convertCurrency() function to recalcuate the amounts based on the exchange rates
                        total += convertCurrency(d, propsCurrency).convAmount;
                    }
                }
                if (total !== 0) {
                    dataTemp.value = Math.round(total * 100) / 100;
                    displayedData.push(dataTemp);
                }
            }
            return displayedData;
        }

        for (let cat of segType) {
            let dataTemp = {
                label: cat
            }
            let total = 0;
            for (let d of data) {
                if (d[type] === cat && getMonth(d.date) === monthsMap.get(selectedMonth)) {
                    // 3/24/20 - calling convertCurrency() function to recalcuate the amounts based on the exchange rates
                    total += convertCurrency(d, propsCurrency).convAmount;
                }
            }
            if (total !== 0) {
                dataTemp.value = Math.round(total * 100) / 100;
                displayedData.push(dataTemp);
            }
        }
    }
    return displayedData;
}