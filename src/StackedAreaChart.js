import { Component } from "react";
import * as d3 from 'd3';

class StackedAreaChart extends Component {
    constructor(props) {
        super(props);
        this.state = {date: []};
    }

    componentDidMount() {
        console.log('StackedAreaChart component mounted');
    }

    componentDidUpdate() {
        console.log('StackedAreaChart component update');
        const rawData = this.props.data;

        const margin = {
            top: 50,
            bottom: 10,
            left: 30,
            right: 30
        };
        const svgWidth = 800 - margin.left - margin.right;
        const svgHeight = 600 - margin.top - margin.bottom;
        const svgContainer = d3.select('#stacked-ac-svg-container')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        
        /**
         * Creating a temporary array to hold the formatted data.  This is
         * temporary because it must be sorted by day aftewards.  However,
         * the logic of this is essentially to create an array of objects
         * of the form {day:..., avg_total_bill:..., avg_tip:...}.  
         * Calculations for the averages are done in the `.map` function.
         */
        let temp = Array.from(new Set(rawData.map(d => d.day)))
            .map(day => {
                const avgTotalBill = rawData
                    .filter(d => d.day === day)
                    .reduce(
                        (total, currData) => total + currData.total_bill, 
                        0
                    ) / rawData.filter(d => d.day === day).length;

                const avgTip = rawData
                    .filter(d => d.day === day)
                    .reduce(
                        (total, currData) => total + currData.tip,
                        0
                    ) / rawData.filter(d => d.day === day).length;
                
                return {
                    day: day,
                    avg_total_bill: avgTotalBill,
                    avg_tip: avgTip
                };
            });

        /**
         * Here, the data is sorted by day.
         */
        const formattedData = [
            temp.find(d => d.day === 'Thur'),
            temp.find(d => d.day === 'Fri'),
            temp.find(d => d.day === 'Sat'),
            temp.find(d => d.day === 'Sun'),
        ];

        /**
         * `d3.stack()` aids in generating stacked data, where each "stack" is
         * really a group of elements sorted by key.  Because we are creating 
         * an array chart that stacks the `total_bill` area with the `avg_tip`
         * area, our keys will be those 2.
         * 
         * The function returns a generator function in which the formatted
         * data can be passed into.  It is important to note that the data 
         * must contain fields that match the keys that were used when 
         * creating the `stackGenerator`.
         */
        const stackGenerator = d3.stack().keys(['avg_total_bill', 'avg_tip']);
        const stackedData = stackGenerator(formattedData);
        console.log(stackedData);

        const days = Array.from(new Set(formattedData.map(d => d.day)));
        const xScale = d3.scaleLinear()
            .domain([0, 3.5])
            .range([margin.left, svgWidth]);

        const xAxis = d3.axisBottom(xScale)
            .ticks(4)
            .tickFormat((_, i) => days[i]);
        
        const yScaleHeight = svgHeight - margin.top - 25;
        const yMax = d3.max([
            d3.max(stackedData[0].map(d => d[0])),
            d3.max(stackedData[0].map(d => d[1])),
            d3.max(stackedData[1].map(d => d[0])),
            d3.max(stackedData[1].map(d => d[1])),
        ]);
        console.log(yMax);
        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([yScaleHeight, margin.top]);
        
        const colorscale = d3.scaleOrdinal()
            .domain(['avg_total_bill', 'avg_tip'])
            .range(['blue', 'green']);
        
        svgContainer.selectAll('#stacked-ac-x-axis-g')
            .data([0])
            .join('g')
            .attr('id', 'stacked-ac-x-axis-g')
            .attr('transform', `translate(0, ${yScaleHeight})`)
            .call(xAxis)

        svgContainer.selectAll('#stacked-ac-y-axis-g')
            .data([0])
            .join('g')
            .attr('id', 'stacked-ac-y-axis-g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));
        
        /**
         * It is important to know the structure of the data that
         * will be passed into `areaGenerator`.  Since the structure
         * is as follows: [x, y, data: {...}], we must specify
         * how to use these array elements for the path element.
         */
        const areaGenerator = d3.area()
            .x(d => xScale(days.indexOf(d.data.day)))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));
        
        svgContainer.selectAll('#stacked-ac-plot-group')
            .data([0])
            .join('g')
            .attr('id', 'stacked-ac-plot-group');
        const plotGroup = svgContainer.select('#stacked-ac-plot-group')
            .attr('transform', `translate(0, 0)`);
        
        plotGroup.selectAll('.area')
            .data(stackedData)
            .join('path')
            .attr('className', 'area')
            .attr('d', d => {
                /**
                 * Recall that stackedData is created by putting `formattedData`
                 * through the `stackGenerator`.  The resuling array consists
                 * of N elements, where N is the number of keys.  Therefore,
                 * binding the stackedData in this selection implies that
                 * there are N elements to go through, where each element
                 * has multiple sub elements which contain the [x, y] 
                 * point coordinates needed for the `areaGenerator`.
                 */
                return areaGenerator(d)
            })
            .attr('fill', d => colorscale(d.key));
    }

    render() {
        return (
            <div>
                <svg id="stacked-ac-svg-container" />
            </div>
        );
    }
}

export default StackedAreaChart;