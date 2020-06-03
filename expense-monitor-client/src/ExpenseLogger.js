import React from 'react';
import {Modal, Button, Spinner} from 'react-bootstrap';
import {parseDate, getSystemTime} from './utilitiess/CommonUtils';
import axios from 'axios';
import config from './config';
import './ExpenseLogger.css';

export class ExpenseLogger extends React.Component {

    constructor(props) {
        super(props);
        let subCategories = this.setExpenseSubCategories(config.expenseDefaults.defaultExpenseCategory);
        this.state = {
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
            loading : {
                save : false
            }
        };
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
        let selectedCurrencies = this.props.currencyConversions.get(this.state.selectedCurrency);
        for(let currency of selectedCurrencies.keys()) {
            //console.log(currency+' '+selectedCurrencies.get(currency));
            rates[currency] = selectedCurrencies.get(currency);
        }
        rates.timeStamp = getSystemTime();
        let user_name = this.props.username;

        if (this.state.incomeToggle) {
            expData = {
                username: user_name,
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
                username: user_name,
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
                    expenseDate: parseDate(null),
                    paymentType: config.expenseDefaults.defaultPaymentType,
                    expenseCategory: config.expenseDefaults.defaultExpenseCategory,
                    expenseSubCategories: subCategories,
                    expenseSubCategory: (subCategories) ? subCategories[0] : '',
                    expenseAmount: config.expenseDefaults.defaultAmount,
                    selectedCurrency: config.expenseDefaults.defaultCurrency,
                    incomeToggle: false,
                    loading: {
                        save: false
                    }
                });

                this.props.onHide(true);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render() {
        return (
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={this.props.showModal}>
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter" className="modal-title-c">Add {this.state.incomeToggle ? "Income" : "Expense"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container">
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
                        <div className="row" id="addExpense">
                            <div className="col-3"></div>
                            <div className="col-6">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="expenseDate">Date</label>
                                        <input type="date" className="form-control" id="expenseDate" onChange={this.expenseDateChangeHandler} value={this.state.expenseDate} />
                                    </div>
                                    {this.state.incomeToggle ? 

                                    <div className="form-group">
                                        <label htmlFor="incomeType">Income Type</label>
                                        <select className="form-control" id="incomeType" value={this.state.incomeType} onChange={this.incomeTypeHandler}>
                                            {this.state.incomeTypeList.map(type => <option key={type}>{type}</option>)}
                                        </select>
                                    </div> :

                                    <div>
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
                                    </div> }
                                    <div className="form-group">
                                        <label htmlFor="expenseAmount">Amount</label>
                                        <input type="number" className="form-control" id="expenseAmount" value={this.state.expenseAmount} onChange={this.expenseAmountHandler} />
                                    </div>

                                    {this.state.incomeToggle ? 
                                    <div className="form-group">
                                        <label htmlFor="expenseComment">Comment</label>
                                        <textarea className="form-control" id="expenseComment" value={this.state.comment} onChange={this.commentHandler} />
                                    </div> : ''}

                                    <div className="form-group">
                                        <label htmlFor="expenseCurrency">Currency</label>
                                        <select className="form-control" id="expenseCurrency" value={this.state.selectedCurrency} onChange={this.currencyHandler}>
                                            {this.state.currency.map(type => <option key={type}>{type}</option>)}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div className="col-2"></div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={e => this.props.onHide(false)}>Close</Button>
                    {!this.state.loading.save ? <Button onClick={this.saveExpense}>Save</Button> :
                        <div className="btn loading">
                            <Spinner animation="border" />
                        </div>}
                </Modal.Footer>
            </Modal>
        );
    }
}