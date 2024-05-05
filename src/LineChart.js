import { Component } from "react";
import * as d3 from 'd3';

class LineChart extends Component {
    constructor(props) {
        super(props);
        this.state = {data: []};
    }

    componentDidMount() {
        console.log('LineChart component mounted');
    }

    componentDidUpdate() {
        console.log('LineChart component updated');

        /**
         * Data is formatted slightly differently for line charts.  It must be 
         * that the data is an array of arrays, such that the nested arrays
         * are of size 2. We will compare total bill and tip relationship again,
         * where total bill is the x coordinate and tip is the y coordinate.
         */
        const propsData = this.props.data;
        console.log(propsData);
        const rawData = propsData.map(d => [d.total_bill, d.tip]);
        
        /** 
         * Here we provide the margins that will be used for the plot itself.  We create 
         * extra room at the top for title space.
         */
        const margin = {
            top: 50,
            bottom: 10,
            left: 30,
            right: 30
        };

        const svgWidth = 800 - margin.left - margin.right;
        const svgHeight = 600 - margin.top - margin.bottom;

        const svgContainer = d3.select('#svg-line-chart-container')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        /**
         * Here we create the title text.
         */
        svgContainer.selectAll('text')
            .data([0])
            .join('text')
            .attr('y', 30)
            .attr('x', svgWidth / 2)
            .attr('stroke', 'blue')
            .attr('font-size', 15)
            .text('Line Chart: Total Bill vs Tips');

        svgContainer.selectAll('g')
            .data([0])
            .join('g')
            .attr('id', 'line-chart-plot-group');
        const plotGroup = svgContainer.select('#line-chart-plot-group')
            .attr('transform', `translate(${margin.left}, 0)`);
        
        const xData = rawData.map(d => d[0]);
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(xData)])         // use domain for actual range of data
            .range([margin.left, svgWidth]);    // use range to set the pixel/screen size of the scale
        
        const yScaleHeight = svgHeight - margin.top - 25;
        const yData = rawData.map(d => d[1]);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(yData)])
            .range([yScaleHeight, margin.top]);
        
        const xAxisGroup = svgContainer.selectAll('#line-chart-x-axis-g')
            .data([0])
            .join('g')
            .attr('id', 'line-chart-x-axis-g')
            .attr('transform', `translate(0, ${yScaleHeight})`)
            .call(d3.axisBottom(xScale));
    
        const yAxisGroup = svgContainer.selectAll('#line-chart-y-axis-g')
            .data([0])
            .join('g')
            .attr('id', 'line-chart-y-axis-g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        /**
         * Here we have a nested function that acts as a predicate for 
         * sorting the data.  Data must be sorted for line charts by 
         * their x axis.
         */
        const sortingPredicate = (a, b) => a[0] - b[0];
        
        /**
         * Before we begin plotting, we must keep in mind that the x
         * and y coordinates of the raw data is NOT scaled to the
         * axes we have defined.  Therefore,we must map each point's
         * x and y coordinates according to the x and y scales.
         */
        const formattedData = rawData.map(
            d => [xScale(d[0]), yScale(d[1])]
        );
        /**
         * Here, the `sortingPredicate` is used to sort the data.
         */
        formattedData.sort(function(a, b) {
            return sortingPredicate(a, b);
        });

        /**
         * Few things happen here:
         *  1. To create path data, we must have a line generator
         *  function which is offered by d3.  the `.curve` method
         *  is optional, but helps customize how the output line
         *  will look.
         * 
         *  2. `pathData` is created based on the lineGenerator
         *  that was previously defined, and the data that was
         *  formatted before.
         * 
         *  3. We append a new 'path' element to the line chart
         *  group element, setting the attributes accordingly.
         *  To apply the path data, set the `d` attribute of path
         *  elements.
         */
        const lineGenerator = d3.line().curve(d3.curveCardinal);
        const pathData = lineGenerator(formattedData);
        plotGroup.selectAll('#line-chart-path')
            .data([0])
            .join('path')
            .attr('id', 'line-chart-path')
            .attr('d', pathData)
            .style('fill', 'none')
            .style('stroke', 'blue');
    }
    
    render() {
        return (
            <div>
                <svg id="svg-line-chart-container" />
            </div>
        );
    }
}

export default LineChart;
