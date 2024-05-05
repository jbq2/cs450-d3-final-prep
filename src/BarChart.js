import { Component } from "react";
import * as d3 from 'd3';

class BarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {data: []};
    }

    componentDidMount() {
        console.log('BarChart component mounted');
    }

    componentDidUpdate() {
        console.log('BarChart component updated');
        const rawData = this.props.data;
        
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

        const svgContainer = d3.select('#svg-bar-chart-container')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        /**
         * To much more easily create bar charts, an array of arrays should be created
         * such for each nested array, the first element is the category (or key), and
         * the second element is the value of that category.  In this bar chart, we
         * decided to display the average total_bill on different days in the tips
         * data set.  To format our data, we use the `flatRollup` method, which 
         * essentially groups data based on the key (d.day), and for each group, we
         * reduce it to a single value (d.reduce(...)).
         * 
         * The output is equivalent to the method `getAveragePerDay`, which was the
         * original implementation for getting the average total tips per day.
         */
        const avgPerDay = d3.flatRollup(
            rawData,
            d => d.reduce((total, curr) => total + curr.total_bill, 0) / d.length,
            d => d.day
        );
        console.log(avgPerDay);

        // const avgPerDay = this.getAveragePerDay(rawData, 'total_bill');

        /**
         * Notice that a different scaling function is used here as opposed to
         * `scaleLinear`.  `scaleBand` is a scaling function that properly 
         * distributes the band width of each categoriy passed in the `.domain`
         * clause.  `.padding` is a function that that accepts a float depicting
         * the percentage amount of the band width that will be used as padding.
         */
        const xScale = d3.scaleBand()
            .domain(avgPerDay.map(d => d[0]))
            .range([margin.left, svgWidth])
            .padding(0.2);
        
        const yScaleHeight = svgHeight - margin.top - 25;
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(avgPerDay.map(d => d[1]))])
            .range([yScaleHeight, margin.top]);
        
        svgContainer.selectAll('#bar-chart-x-axis-g')
            .data([0])
            .join('g')
            .attr('className', 'bar-chart-x-axis-g')
            .attr('transform', `translate(0, ${yScaleHeight})`)
            .call(d3.axisBottom(xScale));

        svgContainer.selectAll('#bar-chart-y-axis-g')
            .data([0])
            .join('g')
            .attr('className', 'bar-chart-y-axis-g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));
        
        const plotGroup = svgContainer.selectAll('#bar-chart-plot-group')
            .data([0])
            .join('g')
            .attr('className', 'bar-chart-plot-group')
            /**
             * Note that when we are performing a translation, we are in the plot group
             * selection.  The plot group selection is already within the margin-adjusted
             * svg container, and therefore, should not need anymore adjustments.  This
             * explains why we translate to (0, 0), and not (margin.left, margin.top) 
             */
            .attr('transform', `translate(0, 0)`);
        
        plotGroup.selectAll('rect') 
            .data(avgPerDay)
            .join('rect')
            .attr('x', d => xScale(d[0]))
            .attr('y', d => yScale(d[1]))
            .attr('width', xScale.bandwidth())
            .attr('height', d => yScaleHeight - yScale(d[1]))
            .attr('fill', 'pink');
    }

    getAveragePerDay(data, field) {
        const self = this;
        return Array.from(new Set(data.map(d => d.day)))
            .map(day => [day, self.getAverageInDay(data, day, field)]);
    }

    getAverageInDay(data, day, field) {
        const total = data
            .filter(d => d.day === day)
            .reduce((accumulator, curr) => accumulator + curr[field], 0);
        const numRecords = data.filter(d => d.day === day).length;
        return total / numRecords;
    }

    render() {
        return (
            <div>
                <svg id="svg-bar-chart-container" />
            </div>
        );
    }
}

export default BarChart;
