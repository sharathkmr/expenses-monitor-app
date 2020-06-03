import React from 'react';
import config from './config';
import './ExpenseDataContainer.css';
import axios from 'axios';
import {HorizontalBarChart} from './HorizontalBarChart';
import {getHBarData, parseDate, calculateTotalAmount, convertCurrency, segregateDataByType} from './utilitiess/CommonUtils';
import ReactLoading from 'react-loading';
import {ExpenseLogger} from './ExpenseLogger';

// ExpenseDataContainer Component
export class ExpenseDataContainer extends React.Component {
    constructor(props) {
        super(props);
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
            hBarData : [], // Horizontal Bar Data
            loading : {
                data : true
            },
            currencyConversions : [], // to hold the exchange rates
            currencyChanged : false // to recalculate the amounts based on curreny selected from NavBar Component
        };
        this.currencyConversions(); // get the exchange rates on load
        this.getExpenses(); // get the expenses on load
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

    hideAddExpenseModal = (saveOperation) => {
        this.setState({
            toggleAddExpense : false,
            updateData : saveOperation ? true : false
        });
    }
    
    render() {
        return (
            <div>
                <ExpenseLogger showModal={this.state.toggleAddExpense} onHide={this.hideAddExpenseModal} currencyConversions={this.state.currencyConversions} username={this.state.username}/>
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
            </div>
        );
    }
}