import { Component } from "react";
import * as d3 from 'd3';

class HorizontalBarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {data: []};
    }

    componentDidMount() {
        console.log('HorizontalBarChart component mounted');
    }

    componentDidUpdate() {
        console.log('HorizontalBarChart component updated');
        const rawData = this.props.data;
        
        /** 
         * Here we provide the margins that will be used for the plot itself.  We create 
         * extra room at the top for title space.
         */
        const margin = {
            top: 50,
            bottom: 10,
            left: 50,
            right: 10
        };

        const svgWidth = 700 - margin.left - margin.right;
        const svgHeight = 800 - margin.top - margin.bottom;

        const svgContainer = d3.select('#svg-hor-bar-chart-container')
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

        /**
         * Since this is horizontal bar chart, the x axis will represent the dependent
         * variable.  In the mapping function, this would be `d[1]`.
         */
        const xMax = d3.max(avgPerDay.map(d => d[1]));
        const xScale = d3.scaleLinear()
            .domain([0, xMax])
            .range([margin.left, svgWidth]);

        /**
         * Again, since this is a horizontal bar chart, the y axis will represent
         * the independent variable, or categories.
         */
        const yScaleHeight = svgHeight - margin.top - 25;
        const yScale = d3.scaleBand()
            .domain(avgPerDay.map(d => d[0]))
            .range([yScaleHeight, margin.top])
            .padding(0.2);

        svgContainer.selectAll('#hor-bar-chart-x-axis-g')
            .data([0])
            .join('g')
            .attr('className', 'hor-bar-chart-x-axis-g')
            .attr('transform', `translate(0, ${yScaleHeight})`)
            .call(d3.axisBottom(xScale));
        
        svgContainer.selectAll('#hor-bar-chart-y-axis-g')
            .data([0])
            .join('g')
            .attr('className', 'hor-bar-chart-y-axis-g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        const plotGroup = svgContainer.selectAll('#hor-bar-chart-plot-group')
            .data([0])
            .join('g')
            .attr('id', 'hor-bar-chart-plot-group')
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
            /**
             * We want to position the rectangles to the start always
             * at the very left edge of the plot.  1 was added to slightly
             * offset the bars so that they don't cover the axis.
             */
            .attr('x', xScale(0) + 1)
            /**
             * We set the y based on `d[0]`, which is the category/
             */
            .attr('y', d => yScale(d[0]))
            .attr('width', d => {
                console.log(d);
                /**
                 * Finally, we set the width of the bars scaling it based
                 * on the dependent variable scale.  We subtract `margin.left`
                 * because the scaling function had a range that started at
                 * `margin.left`.  If we didn't subtract margin.left, then the
                 * bars would overflow/get cut off on the right side.
                 */
                return xScale(d[1]) - margin.left;
            })
            .attr('height', yScale.bandwidth())
            .attr('fill', 'pink');
    }

    render() {
        return (
            <div>
                <svg id="svg-hor-bar-chart-container" />
            </div>
        );
    }
}

export default HorizontalBarChart;