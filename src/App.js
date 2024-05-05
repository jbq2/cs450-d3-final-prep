import './App.css';
import { Component } from 'react';
import * as d3 from 'd3';
import tips from './tips.csv';
import ScatterPlot from './ScatterPlot';
import LineChart from './LineChart';
import NormalAreaChart from './NormalAreaChart';
import BarChart from './BarChart';
import PieChart from './PieChart';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {data: []};
    }

    componentDidMount() {
        let self = this;
        d3
            .csv(tips, function(d) {
                return {
                    total_bill: parseFloat(d.total_bill),
                    tip: parseFloat(d.tip),
                    size: parseInt(d.size),
                    day: d.day
                }
            })
            .then(function(csvData) {
                self.setState({data: csvData});
            });

        // this.setState({data: formattedData});
        // this.props.data = formattedData;
    }

    render() {
        return (
            <div>
                <ScatterPlot data={ this.state.data } />
                <LineChart data={ this.state.data } />
                <NormalAreaChart data={ this.state.data } />
                <BarChart data={ this.state.data } />
                <PieChart data={ this.state.data } />
            </div>
        );
    }
}

export default App;
