import React from 'react';
import { Chart } from 'chart.js';
import './PieChart.css';
import {getColors} from './utilitiess/ColorGenerator';

export class PieChart extends React.Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
        this.state = {
            labels : this.props.categories,
            data : this.props.data,
            backgroundColor : getColors(this.props.data.length),
            title : this.props.title,
            displayLegend : this.props.displayLegend
        }
        // console.log(this.state.backgroundColor);
    }
    
    componentDidMount() {
        // console.log('componentDidMount()');
        // console.log(this.state.data);
        this.myChart = new Chart(this.chartRef.current, {
            type: 'pie',
            data: {
                title : 'test',
                labels : this.state.data.map(d => d.label),
                datasets : [{
                    data : this.state.data.map(d => d.value),
                    backgroundColor: this.state.backgroundColor
                }],
            },
            options : {
                maintainAspectRatio: false,
                responsive : false,
                legend : {
                    display : this.state.displayLegend
                }
            }
        });
    }

    componentDidUpdate() {
        // updating the chart data to reflect the changes in Bar Chart
        // console.log('componentDidUpdate()');
        
        let data = this.props.data.map(d => d.value);
        let categories = this.props.data.map(d => d.label);
        
        this.myChart.data.datasets[0].data = data;
        this.myChart.data.labels = categories;
        this.myChart.data.datasets[0].backgroundColor = getColors(data.length);
        this.myChart.update();
    }

    render() {
        return (
            <canvas ref={this.chartRef} />
        );
    }
}