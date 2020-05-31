import React from 'react';
import { Chart } from 'chart.js';
import './HorizontalBarChart.css';

export class HorizontalBarChart extends React.Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();

        this.state = {
            labels : this.props.categories,
            data : this.props.data,
            backgroundColor : [
                // chartjs accepts rgba - a stands for alpha
                // a = 0 stands for full transperacy
                'rgba(0, 255, 0, 0.3)',
                'rgba(255, 0, 0, 0.3)'
            ]
        }
    }

    componentDidMount() {
        let data = this.state.data.map(d => d.value);

        // Added to change the X-Axis label dynamically
        let xLabel;
        if(this.props.currency) {
            xLabel = 'Amount ('+this.props.currency+')';
        } else {
            xLabel = "Amounts ($)";
        }

        this.myChart = new Chart(this.chartRef.current, {
            type: 'horizontalBar',
            data: {
                labels : this.state.data.map(d => d.label),
                datasets : [{
                    label : 'Income vs Expense', // legend label
                    maxBarThickness: 40,
                    barPercentage: 0.5,
                    data : this.state.data.map(d => d.value),
                    backgroundColor: this.state.backgroundColor
                }],
            },
            options : {
                legend : {
                    display : true,
                    labels : {
                        boxWidth : 0
                    }
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            display: false
                        }
                    }],
                    xAxes: [{
                        // x-axis zero or base line 
                        gridLines: {
                            zeroLineColor: "black",
                            zeroLineWidth: 2
                        },
                        // xaxis range
                        ticks: {
                            min: 0,
                            max: Math.max(...data) + 1000,
                            stepSize: Math.round((Math.max(...data) + 1000) / 5)
                        },
                        // x-axis label configuration
                        scaleLabel: {
                            display: true,
                            labelString: xLabel
                        }
                    }]
                },
                elements: {
                    rectangle: {
                        borderSkipped: 'left',
                    }
                },
                'onClick' : this.handleOnClick
            }
        });
    }

    handleOnClick = (evt, item) => {
        if(item.length === 0) {
            return;
        }
        var day = item[0]['_model'].label
        console.log(day);
        this.props.handleOnClick(day);
    }
    
    componentDidUpdate() {
        // updating the chart data to reflect the changes in Bar Chart
        let data = this.props.data.map(d => d.value);

        // Added to change the X-Axis label dynamically
        let xLabel;
        if(this.props.currency) {
            xLabel = 'Amount ('+this.props.currency+')';
        } else {
            xLabel = "Amounts ($)";
        }
        
        this.myChart.data.datasets[0].data = data;
        this.myChart.options.scales.xAxes[0].ticks.max = Math.max(...data) + 1000;
        this.myChart.options.scales.xAxes[0].ticks.stepSize = Math.round((Math.max(...data) + 1000) / 5);
        this.myChart.options.scales.xAxes[0].scaleLabel.labelString = xLabel; 
        this.myChart.update();
    }

    render() {
        return (
            <canvas ref={this.chartRef} />
        );
    }
}