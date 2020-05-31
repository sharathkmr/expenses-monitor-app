import React from 'react';
import config from './config'
import {ExpenseDataContainer} from './ExpenseDataContainer';
import {DashboardApp} from './DashboardApp'
import './NavBar.css';
import {getCurrentYear} from './utilitiess/CommonUtils';

export class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            years: config.yearsFinal,
            selectedYear : getCurrentYear(),
            updateData : false,
            username : 'sharathBashini',
            toggleDashboard : false,
            toggleExpenseManager : true,
            currency : config.expenseDefaults.defaultCurrency // Selected currency - NavBar level
        };
    }

    yearHandler = (e) => {
        console.log('year selected: ',e.target.value);
        this.setState(
            {
                selectedYear : e.target.value,
                updateData : true
            }
        );
        //console.log(this.state.selectedYear);
    }

    toggleDashboard = (e) => {
        this.setState({
            toggleDashboard : true,
            toggleExpenseManager : false
        });
    }

    toggleExpenseManager = (e) => {
        this.setState({
            toggleDashboard : false,
            toggleExpenseManager : true
        });
    }

    currencyHandler = (e) => {
        console.log('currency selected: ',e.target.value);
        this.setState({
            currency : e.target.value
        });
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="/#">Home</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className={this.state.toggleDashboard ? 'nav-item active':'nav-item'}>
                                <a className="nav-link" href="/#" onClick={this.toggleDashboard}>Dashboard <span className="sr-only">(current)</span></a>
                            </li>
                            <li className={this.state.toggleExpenseManager ? 'nav-item active':'nav-item'}>
                                <a className="nav-link" href="/#" onClick={this.toggleExpenseManager}>Expense Management</a>
                            </li>
                        </ul>
                        <form className="form-inline">
                            {/* Top level currency selector */}
                            <div className="navElements">
                                <select className="form-control" id="currency" value={this.state.currency} onChange={this.currencyHandler}>
                                    {/* 3/3/2020 - Added Default option for currency to show the original/non-converted data */}
                                    <option key="Default">Default</option>
                                    {config.currency.map(type => <option key={type}>{type}</option>)}
                                </select>
                            </div>
                            <select className="form-control" value={this.state.selectedYear} onChange={this.yearHandler}>
                                {this.state.years.map(year => <option key={year}>{year}</option>)}
                            </select>
                        </form>
                    </div>
                </nav>
                <div className="expenseDataContainer">
                    {
                        this.state.toggleDashboard ?
                            /* 3/24/20 - Added Currency for Multi-Currency implementation */
                            <DashboardApp year={this.state.selectedYear} username={this.state.username} updateData={this.state.updateData} currency={this.state.currency}/>
                            :
                            /* 2/22/20 - Added Currency for Multi-Currency implementation */
                            <ExpenseDataContainer year={this.state.selectedYear} currency={this.state.currency} updateData={this.state.updateData}/>
                    }
                </div>
            </div>
        );
    }
}