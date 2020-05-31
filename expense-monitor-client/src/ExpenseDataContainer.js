import React from 'react';
import config from './config';
import './ExpenseDataContainer.css';
import axios from 'axios';
import {HorizontalBarChart} from './HorizontalBarChart';
import {getHBarData, parseDate, calculateTotalAmount, convertCurrency, getSystemTime, segregateDataByType} from './utilitiess/CommonUtils';
import ReactLoading from 'react-loading';

// ExpenseDataContainer Component
export class ExpenseDataContainer extends React.Component {
    constructor(props) {
        super(props);
        let subCategories = this.setExpenseSubCategories(config.expenseDefaults.defaultExpenseCategory);
        this.state = {
            username : 'sharathBashini',
            selectedYear : this.props.year,
            updateData : this.props.updateData,
            toggleAddExpense : false,
            months: config.monthsFinal,
            selectedMonth : config.expenseDefaults.defaultMonth,
            data: [], // Expense Data
            displayedData : [], // Expense Data filtered
            incomeData : [], // Income Data
            displayedIncomeData : [], // Income Data filtered
            // Expense Attributes
            expenseDate : parseDate(null),
            paymentTypes: config.paymentType,
            paymentType: config.expenseDefaults.defaultPaymentType,
            expenseCategories: config.expenseCategory,
            expenseCategory: config.expenseDefaults.defaultExpenseCategory,
            expenseSubCategories: subCategories,
            expenseSubCategory: (subCategories) ? subCategories[0]: '',
            expenseAmount: config.expenseDefaults.defaultAmount,
            currency : config.currency,
            selectedCurrency : config.expenseDefaults.defaultCurrency, // selected currency from NavBar component
            // Income Attributes
            incomeToggle : false,
            incomeTypeList : config.incomeType,
            incomeType : config.expenseDefaults.incomeType,
            comment : '',
            hBarData : [], // Horizontal Bar Data
            loading : {
                save : false,
                data : true
            },
            currencyConversions : [], // to hold the exchange rates
            currencyChanged : false // to recalculate the amounts based on curreny selected from NavBar Component
        };
        this.currencyConversions(); // get the exchange rates on load
        this.getExpenses(); // get the expenses on load
    }

    setExpenseSubCategories(category) {
        const subCategoriesMap = new Map(Object.entries(config.expenseSubCategories));
        let subCategories = subCategoriesMap.get(category);
        return subCategories;
    }

    handleIncomeToggle = (e) => {
        let incomeToggle;
        if(e.target.value === 'Income') {
            incomeToggle = true;
        } else {
            incomeToggle = false;
        }
        this.setState({
            incomeToggle : incomeToggle
        });
    }

    incomeTypeHandler = (e) => {
        console.log('incomeType: ',e.target.value);
        this.setState({
            incomeType : e.target.value
        });
    }

    addExpense = () => {
        // console.log('add expense');
        this.setState({
            toggleAddExpense : true
        });
    }

    searchHandler = (e) => {
        // console.log('search Handler');
        let value = e.target.value;
        // 3/24/20 - moved the function segregateData() to CommonUtils.js -> segregateDataByType() to make it reusable
        let displayedData = segregateDataByType(this.state.data, config.monthsMap, this.state.selectedMonth, '', '', '');
        let filteredData;
        if(value) {
            filteredData = displayedData.filter((data) => {
                if(data.sub_category) {
                    return data.category.toLowerCase().includes(value.toLowerCase()) || data.sub_category.toLowerCase().includes(value.toLowerCase());
                } else {
                    return data.category.toLowerCase().includes(value.toLowerCase())
                }
            });
        } else {
            filteredData = displayedData;
        }

        this.setState({
            displayedData : filteredData
        });
    }

    monthHandler = (e) => {
        console.log('Selected Month: ',e.target.value);
        // 3/24/20 - moved the function segregateData() to CommonUtils.js -> segregateDataByType() to make it reusable
        let displayedData = segregateDataByType(this.state.data, config.monthsMap, e.target.value, '', '', '');
        let displayedIncomeData = segregateDataByType(this.state.incomeData, config.monthsMap, e.target.value, '', '', '');
        let totalExpenses = calculateTotalAmount(displayedData);
        let totalIncome = calculateTotalAmount(displayedIncomeData);

        this.setState({
            selectedMonth : e.target.value,
            displayedData : displayedData,
            displayedIncomeData : displayedIncomeData,
            hBarData : getHBarData(totalIncome, totalExpenses)
        });
    }

    cancelAddExpense = () => {
        this.setState({
            toggleAddExpense : false,
            incomeToggle : false
        });
    }

    expenseDateChangeHandler = (e) => {
        console.log('Selected Date: ', e.target.value);
        this.setState({
            expenseDate : e.target.value
        });
    }

    paymentTypeHandler = (e) => {
        console.log('Payment Type: ',e.target.value);
        this.setState({
            paymentType : e.target.value
        });
    }

    expenseCategoryHandler = (e) => {
        console.log('Category: ',e.target.value);
        let subCategories = this.setExpenseSubCategories(e.target.value);
        this.setState({
            expenseCategory : e.target.value,
            expenseSubCategories: subCategories,
            expenseSubCategory : (subCategories) ? subCategories[0]: ''
        });
    }

    expenseSubCategoryHandler = (e) => {
        console.log('Sub Category: ',e.target.value);
        this.setState({
            expenseSubCategory : e.target.value
        });
    }

    expenseAmountHandler = (e) => {
        this.setState({
            expenseAmount : e.target.value
        });
    }

    currencyHandler = (e) => {
        console.log('Currency: ', e.target.value);
        this.setState({
            selectedCurrency : e.target.value
        });
    }

    commentHandler = (e) => {
        // console.log('Comment: ', e.target.value);
        this.setState({
            comment : e.target.value
        });
    }

    saveExpense = () => {
        //console.log(this.state.expenseDate+' '+this.state.paymentType+' '+this.state.expenseCategory+' '+this.state.expenseAmount);
        this.setState({
            loading : {
                save : true
            }
        });
        let expDate = new Date(this.state.expenseDate);
        let expData;

        // 02/19/2020 - for Multi-Currency implementation
        // to get the exchange rates and converting it to an object
        let rates = {};
        let selectedCurrencies = this.state.currencyConversions.get(this.state.selectedCurrency);
        for(let currency of selectedCurrencies.keys()) {
            //console.log(currency+' '+selectedCurrencies.get(currency));
            rates[currency] = selectedCurrencies.get(currency);
        }
        rates.timeStamp = getSystemTime();

        if (this.state.incomeToggle) {
            expData = {
                username: this.state.username,
                year: expDate.getFullYear(),
                logIncome: this.state.incomeToggle,
                sort: { date: 1 },
                income: {
                    date: this.state.expenseDate,
                    income_type: this.state.incomeType,
                    amount: parseFloat(this.state.expenseAmount),
                    comment: this.state.comment,
                    currency: this.state.selectedCurrency,
                    rates : rates // added Exchange Rates for Multi-Currency implementation
                }
            };
        } else {
            expData = {
                username: this.state.username,
                year: expDate.getFullYear(),
                logIncome: this.state.incomeToggle,
                sort: { date: 1 },
                data: {
                    date: this.state.expenseDate,
                    type: this.state.paymentType,
                    category: this.state.expenseCategory,
                    sub_category: this.state.expenseSubCategory,
                    amount: parseFloat(this.state.expenseAmount),
                    currency: this.state.selectedCurrency,
                    rates : rates // added Exchange Rates for Multi-Currency implementation
                }
            };
        }

        axios.post(config.dataService.saveExpenseWithSort, expData)
            .then((resp) => {
                console.log('expense saved successfully ', expData);

                // expense values are rested after successfull save
                let subCategories = this.setExpenseSubCategories(config.expenseDefaults.defaultExpenseCategory);

                this.setState({
                    toggleAddExpense: false,
                    updateData: true,
                    expenseDate: parseDate(null),
                    paymentType: config.expenseDefaults.defaultPaymentType,
                    expenseCategory: config.expenseDefaults.defaultExpenseCategory,
                    expenseSubCategories: subCategories,
                    expenseSubCategory: (subCategories) ? subCategories[0] : '',
                    expenseAmount: config.expenseDefaults.defaultAmount,
                    selectedCurrency: config.expenseDefaults.defaultCurrency,
                    incomeToggle: false,
                    loading : {
                        save : false
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getExpenses = () => {
        this.setState({
            loading : {
                data : true
            }
        });

        console.log('fetching expenses for year ', this.state.selectedYear);
        axios.get(config.dataService.getExpenses, {
            params: {
                username: this.state.username,
                year: this.state.selectedYear
            }
        }).then((resp) => {
            // console.log(resp);
            let data = [];
            let incomeData = [];
            console.log('data: ', resp.data.data.length);

            if (resp.data.data.length === 0) {
                this.setState({
                    data: data,
                    displayedData: data,
                    incomeData: incomeData,
                    displayedIncomeData: incomeData,
                    hBarData: getHBarData(0, 0),
                    loading : {
                        data : false
                    }
                });
                return;
            }
            let respData = resp.data.data[0].data;
            let income = resp.data.data[0].income;

            for (let i = 0; i < respData.length; i++) {
                let dataTemp = respData[i];
                let date = dataTemp.date;
                
                dataTemp.no = (i + 1);
                dataTemp.date = parseDate(date);
                dataTemp = convertCurrency(dataTemp, this.props.currency);
                
                data.push(dataTemp);
            }

            for (let i = 0; i < income.length; i++) {
                let incomeTemp = income[i];
                incomeTemp.no = (i + 1);
                incomeTemp.date = parseDate(incomeTemp.date);
                incomeTemp = convertCurrency(incomeTemp, this.props.currency);
                incomeData.push(incomeTemp);
            }

            // 3/24/20 - moved the function segregateData() to CommonUtils.js -> segregateDataByType() to make it reusable
            let displayedData = segregateDataByType(data, config.monthsMap, this.state.selectedMonth, '', '', '');
            let displayedIncomeData = segregateDataByType(incomeData, config.monthsMap, this.state.selectedMonth, '', '', '');
            let totalExpenses = calculateTotalAmount(displayedData);
            let totalIncome = calculateTotalAmount(displayedIncomeData);

            this.setState({
                data: data,
                displayedData: displayedData,
                incomeData: incomeData,
                displayedIncomeData: displayedIncomeData,
                hBarData: getHBarData(totalIncome, totalExpenses),
                loading : {
                    data : false
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
    }

    componentDidUpdate() {
        // console.log('componentDidUpdate()');
        if(this.state.updateData) {
            this.getExpenses();
            this.setState({
                updateData : false
            });
        }
        
        // 02/21/2020 - added for Multi-Currency Implementation
        // Whenever currency is changed in NavBar, we need to recalcuate the amounts based on the exchange rates
        if(this.state.currencyChanged) {
            let data = this.state.data; // Expense Data
            let incomeData = this.state.incomeData; // Income Data

            for(let i in data) {
                data[i] = convertCurrency(data[i], this.props.currency);
            }

            for(let i in incomeData) {
                incomeData[i] = convertCurrency(incomeData[i], this.props.currency);
            }

            // Segregating the data based on month selection to calculate the total amount for displaying on the bar chart
            // 3/24/20 - moved the function segregateData() to CommonUtils.js -> segregateDataByType() to make it reusable
            let displayedData = segregateDataByType(data, config.monthsMap, this.state.selectedMonth, '', '', '');
            let displayedIncomeData = segregateDataByType(incomeData, config.monthsMap, this.state.selectedMonth, '', '', '');
            let totalExpenses = calculateTotalAmount(displayedData);
            let totalIncome = calculateTotalAmount(displayedIncomeData);

            this.setState({
                data : data,
                incomeData : incomeData,
                hBarData: getHBarData(totalIncome, totalExpenses),
                currencyChanged : false
            });
        }
    }

    // used to update the state values in child to prop (parent state) values when parent state is changed
    componentWillReceiveProps(nextProps) {
        // console.log('componentWillReceiveProps()');
        //console.log('year: ' + this.props.year + ' - updateData: ' + this.props.updateData);
        if (this.props !== nextProps) {
            let updateData = this.state.updateData;
            let currencyChanged = this.state.currencyChanged;
            if(this.state.selectedYear !== nextProps.year) {
                updateData = !updateData;
            }

            /* 3/7/20
             * Modified the below condition to compare with this.props.currency
             * rather than this.state.selectedCurrency. It's causing an issue when
             * default value is introduced in currency selection from navbar component
             */
            if(this.props.currency !== nextProps.currency) {
                currencyChanged = !currencyChanged;
            }

            this.setState({
                selectedYear: nextProps.year,
                updateData : updateData,
                currencyChanged : currencyChanged
            });
        }
    }

    /**
     * currencyConversions() is made as syncronous to get the exchange rates before calling expense api
     * as api is called from a async method and we need to save the data in memory
     */
    currencyConversions = async () => {
        console.log('props: '+this.props.currency);
        let currencies = config.currency.join(',');
        let currencyConversionsMap = new Map();

        for(let currency of config.currency) {
            // we are calling the api for each currency to get the exchange rates
            // as free api doesn't accept multiple currencies in base parameter
            await this.getConversions(currency, currencies).then(function(res) {
                currencyConversionsMap.set(currency, res);
            });
        }
        
        console.log(currencyConversionsMap);
        this.setState({
            currencyConversions : currencyConversionsMap
        });
    }
    
    /**
     * getConversions() is used to call the api for the exchange rates
     * @param  {} base
     * @param  {} symbols
     */
    getConversions = (base, symbols) => {
        let promise = new Promise(function ( resolve, reject ){
            axios.get(config.currencyAPI.exchangeratesapiURI, {
                params: {
                    base: base,
                    symbols : symbols
                }
            }).then((resp) => {
                let rates = resp.data.rates;
                let currencies = config.currency;
                let conversions = new Map();

                for(let currency of currencies) {
                    conversions.set(currency, rates[currency]);
                }
                resolve(conversions);
            }).catch(function (error) {
                console.log(error);
            });
        });
        return promise;
    }
    
    render() {
        return (
            this.state.toggleAddExpense ? 
            (<div className="container">
                <div className="row">
                    <div className="col-3"></div>
                    <div className="col-6">
                        <div className="form-group">
                                <label htmlFor="expensePaymentType">Log Type</label>
                                <select className="form-control" id="expensePaymentType" onChange={this.handleIncomeToggle}>
                                    <option>Expense</option>
                                    <option>Income</option>
                                </select>
                            </div>
                    </div>
                    <div className="col-2"></div>
                </div>
                {this.state.incomeToggle ? (<div className="row" id="addExpense">
                    <div className="col-3"></div>
                    <div className="col-6">
                        <form>
                            <div className="form-group">
                                <label htmlFor="expenseDate">Date</label>
                                <input type="date" className="form-control" id="expenseDate" onChange={this.expenseDateChangeHandler} value={this.state.expenseDate}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="incomeType">Income Type</label>
                                <select className="form-control" id="incomeType" value={this.state.incomeType} onChange={this.incomeTypeHandler}>
                                    {this.state.incomeTypeList.map(type => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseAmount">Amount</label>
                                <input type="number" className="form-control" id="expenseAmount" value={this.state.expenseAmount} onChange={this.expenseAmountHandler}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseComment">Comment</label>
                                <textarea className="form-control" id="expenseComment" value={this.state.comment} onChange={this.commentHandler}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseCurrency">Currency</label>
                                <select className="form-control" id="expenseCurrency" value={this.state.selectedCurrency} onChange={this.currencyHandler}>
                                    {this.state.currency.map(type => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                        </form>
                    </div>
                    <div className="col-2"></div>
                </div>):(<div className="row" id="addExpense">
                    <div className="col-3"></div>
                    <div className="col-6">
                        <form>
                            <div className="form-group">
                                <label htmlFor="expenseDate">Date</label>
                                <input type="date" className="form-control" id="expenseDate" onChange={this.expenseDateChangeHandler} value={this.state.expenseDate}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expensePaymentType">Payment Type</label>
                                <select className="form-control" id="expensePaymentType" value={this.state.paymentType} onChange={this.paymentTypeHandler}>
                                    {this.state.paymentTypes.map(type => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseCategory">Expense Category</label>
                                <select className="form-control" id="expenseCategory" value={this.state.expenseCategory} onChange={this.expenseCategoryHandler}>
                                    {this.state.expenseCategories.map(type => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseSubCategory">Expense Sub-Category</label>
                                <select className="form-control" id="expenseSubCategory" value={this.state.expenseSubCategory} onChange={this.expenseSubCategoryHandler}>
                                    {this.state.expenseSubCategories.map(type => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseAmount">Amount</label>
                                <input type="number" className="form-control" id="expenseAmount" value={this.state.expenseAmount} onChange={this.expenseAmountHandler}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expenseCurrency">Currency</label>
                                <select className="form-control" id="expenseCurrency" value={this.state.selectedCurrency} onChange={this.currencyHandler}>
                                    {this.state.currency.map(type => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                        </form>
                    </div>
                    <div className="col-2"></div>
                </div>)}
                
                <div className="row">
                    <div className="col-3"></div>
                    <div className="col-6">
                        <div className="addExpenseOperations">
                            <button type="button" className="btn btn-outline-success addExpBtns" onClick={this.cancelAddExpense}>Cancel</button>
                            {!this.state.loading.save ? <button type="button" className="btn btn-outline-success addExpBtns" onClick={this.saveExpense}>Save</button>: 
                            <div className="btn loading">
                                <ReactLoading type="bubbles" color="#15eb68"/>
                            </div>}
                        </div>
                    </div>
                    <div className="col-2"></div>
                </div>
            </div>
            )
                :
            <div className="container">
                <div className="row">
                    <div className="col-2">
                        <div className="form-group">
                            <select className="form-control" id="monthSelection" value={this.state.selectedMonth} onChange={this.monthHandler}>
                                {this.state.months.map(month => <option key={month}>{month}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                    </div>
                    <div>
                        <button type="button" className="btn btn-outline-success btn-sm" onClick={this.addExpense}>Log Expense/Income</button>
                    </div>
                    <div className="col-3">
                        <form className="form-inline my-2 my-lg-0 searchBtnCustom">
                            <input className="form-control form-control-sm mr-sm-2" type="search" placeholder="Search" aria-label="Search" onChange={this.searchHandler}/>
                        </form>
                    </div>
                </div>
                <div className="row">
                    <div className="col center">
                    {
                        this.state.loading.data ? 
                            (<div className="btn loading">
                                <ReactLoading type="bubbles" color="#15eb68"/>
                            </div>) : this.state.hBarData.length > 0 ? <HorizontalBarChart data={this.state.hBarData} currency={this.props.currency} handleOnClick={(label) => {console.log('label container: ',label)}}/> : ''
                    }
                    </div>
                </div>
                {
                    this.state.loading.data ? 
                    (<div className="row">
                        <div className="col center">
                            <div className="btn loading">
                                <ReactLoading type="bubbles" color="#15eb68"/>
                            </div>
                        </div>
                    </div>) :
                    this.state.displayedIncomeData.length > 0 ?  
                    (<div className="row" id="incomeTable">
                    <table className="table table-sm" >
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Date</th>
                                <th scope="col">Income Type</th>
                                <th scope="col">Comment</th>
                                <th scope="col">Amount</th>
                            </tr>
                        </thead>
                        <tbody id="expenceData">
                            {this.state.displayedIncomeData.map(income =>
                                <tr key={income.no}>
                                    <th scope="row">{income.no}</th>
                                    <td>{income.date}</td>
                                    <td>{income.income_type}</td>
                                    <td className="wrapText">{income.comment}</td>
                                    {/* 2/22/2020 - modified to use convAmount for Multi-Currency implementation */}
                                    <td>{(income.convCurrency === 'USD') ? '$'+income.convAmount: income.convAmount+' '+income.convCurrency}</td>
                                </tr>)}
                        </tbody>
                    </table>
                    </div>): ''
                }
                {
                    this.state.loading.data ? 
                    (<div className="row">
                        <div className="col center">
                            <div className="btn loading">
                                <ReactLoading type="bubbles" color="#15eb68"/>
                            </div>
                        </div>
                    </div>) :
                    this.state.displayedData.length > 0 ? 
                    (<div className="row" id="expenceTable">
                    <table className="table table-sm" >
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Date</th>
                                <th scope="col">Payment Type</th>
                                <th scope="col">Expense Category</th>
                                <th scope="col">Expense Sub-Category</th>
                                <th scope="col">Amount</th>
                            </tr>
                        </thead>
                        <tbody id="expenceData">
                            {this.state.displayedData.map(exp =>
                                <tr key={exp.no}>
                                    <th scope="row">{exp.no}</th>
                                    <td>{exp.date}</td>
                                    <td>{exp.type}</td>
                                    <td>{exp.category}</td>
                                    <td>{exp.sub_category}</td>
                                    {/* 2/22/2020 - modified to use convAmount for Multi-Currency implementation */}
                                    <td>{(exp.convCurrency === 'USD') ? '$'+exp.convAmount: exp.convAmount+' '+exp.convCurrency}</td>
                                </tr>)}
                        </tbody>
                    </table>
                </div>) : ''
                }
                
            </div>
        );
    }
}