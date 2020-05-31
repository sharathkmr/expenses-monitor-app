import React from 'react';
import {PieChart} from './PieChart';
import axios from 'axios';
import config from './config';
import './DashboardApp.css';
import {HorizontalBarChart} from './HorizontalBarChart';
import {getHBarData, calculateTotalAmount, segregateDataByType} from './utilitiess/CommonUtils';
import ReactLoading from 'react-loading';

export class DashboardApp extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        username : this.props.username,
        year : this.props.year,
        categories : config.expenseCategory,
        data : {},
        months : config.monthsFinal,
        selectedMonth : config.expenseDefaults.defaultMonth,
        categoryData : [],
        subCategoryData : [],
        incomeData : [],
        hBarData : [],
        updateData : false,
        loading : false, // 3/24/20 - to show/hide the loading progress
        currencyUpdated : false // 3/28/20 - to recalculate the amounts based on curreny selected from NavBar Component
      };
    }

    monthHandler = (e) => {
        // 3/24/20 - to show the loading progress
        this.setState({
            loading : true
        });

        // console.log('Selected Month: ',e.target.value);
        // 3/24/20 - moved the function segregateData() to CommonUtils.js -> segregateDataByType() to make it reusable
        let categoryData = segregateDataByType(this.state.data.data, config.monthsMap, e.target.value, 'category', this.state.categories, this.props.currency);
        // console.log('category ',categoryData);
        let subCategoryData = segregateDataByType(this.state.data.data, config.monthsMap, e.target.value, 'sub_category', config.subCategories, this.props.currency);
        // console.log('sub_category ', subCategoryData);
        let incomeData = segregateDataByType(this.state.data.income, config.monthsMap, e.target.value, 'income_type', config.incomeType, this.props.currency);

        // 3/24/20 - modified the below logic to 1st segregate the data based on the selected month and then calculate the totalExpenses/totalIncome
        // 3/24/20 - previosly the totalIncome and totalExpenses were calculated based on incomeData and categoryData, which is failing 
        // as the incomeData and categoryData are formated for PieChart
        let totalExpenses = calculateTotalAmount(segregateDataByType(this.state.data.data, config.monthsMap, e.target.value, '', '', ''));
        let totalIncome = calculateTotalAmount(segregateDataByType(this.state.data.income, config.monthsMap, e.target.value, '', '', ''));

        this.setState({
            selectedMonth : e.target.value,
            categoryData : categoryData,
            subCategoryData : subCategoryData,
            incomeData : incomeData,
            hBarData : getHBarData(totalIncome, totalExpenses),
            loading : false // 3/24/20 - to hide the loading progress
        });
    }

    componentWillReceiveProps(nextProps) {
        // console.log('componentWillReceiveProps()');
        if (this.props !== nextProps) {
            /*
                3/28/20 - We need to recalculate the amount based on the exchange rate.
                So, we are comparing the state and props currency and updating the value
                of currencyUpdated to true to recalculate.
            */
            let currencyUpdated = this.state.currencyUpdated;
            if(this.props.currency !== nextProps.currency) {
                currencyUpdated = !currencyUpdated;
            }

            /*
                3/28/20 - Modified the existing logic to set updateData as true
                whenever the year is changed from navBar component.
            */
            let year = this.state.year;
            let updateData = this.state.updateData;
            if(this.props.year !== nextProps.year) {
                year = nextProps.year;
                updateData = !updateData;
            }
            this.setState({
                year: year,
                updateData: updateData,
                currencyUpdated : currencyUpdated
            });
        }
    }
  
    componentDidMount() {
        this.segregateExpData();
    }

    componentDidUpdate() {
        // console.log('componentDidUpdate()');
        console.log(this.props.year+' : '+this.props.currency);
        // 3/28/20 - modified to check currencyUpdated
        if(this.state.updateData || this.state.currencyUpdated) {
            this.setState({
                updateData : false,
                currencyUpdated : false
            });
            this.segregateExpData();
        }
    }

    segregateExpData = () => {
        // 3/24/20 - to show the loading progress
        this.setState({
            loading : true
        });
        console.log('fetching expenses for year ',this.props.year);
        axios.get(config.dataService.getExpenses, {
            params: {
                username: this.props.username,
                year : this.props.year
            }
        })
        .then((resp) => {
            // console.log(resp);
            let dataValues = [];
            
            if(resp.data.data.length === 0) {
                this.setState({
                    data : dataValues
                });
                return;
            }
            let data = resp.data.data[0];

            // console.log(data);
            
            // 3/24/20 - moved the function segregateData() to CommonUtils.js -> segregateDataByType() to make it reusable
            let categoryData = segregateDataByType(data.data, config.monthsMap, this.state.selectedMonth, 'category', this.state.categories, this.props.currency);
            console.log('category ',categoryData);
            let subCategoryData = segregateDataByType(data.data, config.monthsMap, this.state.selectedMonth, 'sub_category', config.subCategories, this.props.currency);
            console.log('sub_category ', subCategoryData);
            let incomeData = segregateDataByType(data.income, config.monthsMap, this.state.selectedMonth, 'income_type', config.incomeType, this.props.currency);
            console.log('income_type ', incomeData);
            
            // 3/24/20 - modified the below logic to 1st segregate the data based on the selected month and then calculate the totalExpenses/totalIncome
            // 3/24/20 - previosly the totalIncome and totalExpenses were calculated based on incomeData and categoryData, which is failing 
            // as the incomeData and categoryData are formated for PieChart
            let totalExpenses = calculateTotalAmount(segregateDataByType(data.data, config.monthsMap, this.state.selectedMonth, '', '', ''));
            let totalIncome = calculateTotalAmount(segregateDataByType(data.income, config.monthsMap, this.state.selectedMonth, '', '', ''));

            this.setState({
                data : data,
                categoryData : categoryData,
                subCategoryData : subCategoryData,
                incomeData : incomeData,
                hBarData : getHBarData(totalIncome, totalExpenses),
                loading : false // 3/24/20 - to hide the loading progress
            });
            
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    getMonth(date) {
        var parts = date.match(/(\d+)/g);
        return parseInt(parts[1]);
    }

    dynamicBarChart = (label) => {
        console.log('label: ',label);
    }
  
    render() {
        return (
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-2">
                            <div className="form-group">
                                <select className="form-control" id="monthSelection" value={this.state.selectedMonth} onChange={this.monthHandler}>
                                    {this.state.months.map(month => <option key={month}>{month}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col"></div>
                        <div className="col-3"></div>
                    </div>
                </div>
                <div>
                    <div className="row chartContainer">
                        <div className="col chart-wrapper">
                            {
                                /* 3/24/20 - Added loading component */
                                this.state.loading ? <div className="btn loading right"><ReactLoading type="bubbles" color="#15eb68"/></div> :
                                (this.state.categoryData.length > 0 ? <PieChart categories={this.state.categories} data={this.state.categoryData} title="Expenses based on Categories" displayLegend="true" /> : '')
                            }
                        </div>
                        <div className="col chart-wrapper">
                            {
                                /* 3/24/20 - Added loading component */
                                this.state.loading ? <div className="btn loading"><ReactLoading type="bubbles" color="#15eb68"/></div> :
                                (this.state.subCategoryData.length > 0 ? <PieChart categories={this.state.categories} data={this.state.subCategoryData} title="Expenses based on Sub-Categories" displayLegend="true" /> : '')
                            }
                        </div>
                    </div>
                    <div className="row chartContainer">
                        <div className="col chart-wrapper">
                            {
                                /* 3/24/20 - Added loading component */
                                this.state.loading ? <div className="btn loading right"><ReactLoading type="bubbles" color="#15eb68"/></div> :
                                (this.state.data && this.state.data.income && this.state.data.income.length > 0 ? <PieChart categories={this.state.categories} data={this.state.incomeData} title="Income based on Categories" displayLegend="true" /> : <div></div>)
                            }
                        </div>
                        <div className="col barChart chart-wrapper">
                            {
                                /* 3/24/20 - Added loading component */
                                this.state.loading ? <div className="btn loading"><ReactLoading type="bubbles" color="#15eb68"/></div> :
                                (this.state.hBarData.length > 0 ? <HorizontalBarChart data={this.state.hBarData} handleOnClick={this.dynamicBarChart} /> : '')
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}