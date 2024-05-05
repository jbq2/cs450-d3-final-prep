import { Component } from "react";
import * as d3 from 'd3';

/**
 * It's important to note that the below component produces a left-to-right
 * area chart, but a top-to-bottom area chart can also be generated by setting
 * the x0 to a constant number, like xScale(0) or xScale(d3.min(data)), and 
 * making setting the y and x1 functions accordingly.
 */
class NormalAreaChart extends Component {
    constructor(props) {
        super(props);
        this.state = {date: []};
    }

    componentDidMount() {
        console.log('NormalAreaChart component mounted');
    }

    componentDidUpdate() {
        console.log('NormalAreaChart component updated');
        const rawData = this.props.data;

        const margin = {
            top: 50,
            bottom: 10,
            left: 30,
            right: 30
        };

        /** 
         * Below are calculations for setting the width and height of the svg element.
         * 800 and 600 are the base width and height, but we also want to apply the
         * margins.  Therefore, the width and heigth will be sightly less than 800
         * and 600.
         */
        const svgWidth = 800 - margin.left - margin.right;
        const svgHeight = 600 - margin.top - margin.bottom;

        /** 
         * Below we apply the width and height to the svg by selecting the correct
         * svg element--in this case, we select by id.
         */
        const svgContainer = d3.select('#area-chart-svg-container')
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
            .attr('stroke', 'orange')
            .attr('font-size', 15)
            .text('Area Chart: Total Bill vs Tips');

        svgContainer.selectAll('g')
            .data([0])
            .join('g')
            .attr('id', 'area-chart-plot-group');
        const plotGroup = svgContainer.select('#area-chart-plot-group')
            .attr('transform', `translate(0, 0)`);

        /**
         * instead of starting the axes at 0, start at the minimum of each axis
         */
        const xData = rawData.map(d => d.total_bill);
        const xScale = d3.scaleLinear()
            .domain([d3.min(xData), d3.max(xData)])
            .range([margin.left, svgWidth]);
        
        const yScaleHeight = svgHeight - margin.top - 25;
        const yData = rawData.map(d => d.tip);
        const yScale = d3.scaleLinear()
            .domain([d3.min(yData), d3.max(yData)])
            .range([yScaleHeight, margin.top]);
        
        svgContainer.selectAll('#area-chart-x-axis-group')
            .data([0])
            .join('g')
            .attr('id', 'area-chart-x-axis-group')
            .attr('transform', `translate(0, ${yScaleHeight})`)
            .call(d3.axisBottom(xScale));

        svgContainer.selectAll('#area-chart-y-axis-group')
            .data([0])
            .join('g')
            .attr('id', 'area-chart-y-axis-group')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        /**
         * To create area charts, an area generator is required which is
         * obtained from using the d3.area() function and setting the x,
         * y0, and y1 fields, which are essentially functions that will
         * be applied to the data passed into it.  For example, if the 
         * element of the data you have is formatted as follows: 
         * {x: ..., y: ...}, then the below code will work.  However, if
         * you have data that is formatted as follows: [x, y], then your
         * arrow functions should be as follows: 
         *      x(d => xScale(d[0]))
         *      y1(d => yScale(d[1]))
         */
        const areaGenerator = d3.area()
            .x(d => xScale(d.x))
            .y0(yScale(d3.min(yData)))
            .y1(d => yScale(d.y));
        
        /**
         * The below code is commented out, but can display the ability
         * to create a top to bottom area chart.
         */
        // const areaGenerator = d3.area()
        //     .y(d => yScale(d.x))
        //     .x0(xScale(d3.min(yData)))
        //     .x1(d => xScale(d.y));

        const formattedData = rawData.map(d => {
            return {x: d.total_bill, y: d.tip};
        });
        formattedData.sort((a, b) => a.x - b.x);
        console.log(formattedData);

        /**
         * Generated the area chart data using the `formattedData` and 
         * feeding it into `areaGenerator`.
         */
        const generatedArea = areaGenerator(formattedData);
        plotGroup.selectAll('#area-chart-path')
            .data([0])
            .join('path')
            .attr('d', generatedArea)
            .attr('fill', 'yellow')
            .attr('stroke', 'orange');
    }

    render() {
        return (
            <div>
                <svg id="area-chart-svg-container" />
            </div>
        );
    }
}

export default NormalAreaChart;