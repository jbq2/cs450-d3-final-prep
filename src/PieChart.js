import { Component } from "react";
import * as d3 from 'd3';

class PieChart extends Component {
    constructor(props) {
        super(props);
        this.state = {data: []};
    }

    componentDidMount() {
        console.log('PieChart component mounted');
    }

    componentDidUpdate() {
        console.log('PieChart component updated');
        const rawData = this.props.data;
        
        const margin = {
            top: 50,
            bottom: 10,
            left: 30,
            right: 30
        };

        const svgWidth = 800 - margin.left - margin.right;
        const svgHeight = 600 - margin.top - margin.bottom;

        const svgContainer = d3.select('#pie-chart-svg-container')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        /**
         * Similar to bar chart data formatting, except each element is mapped to an object
         * containing a `day` and `avg_total_bill` field for easier readability (specifically
         * in that part where `pieGenerator` is created).
         */
        const avgPerDay = d3
            .flatRollup(
                rawData,
                d => d.reduce((total, curr) => total + curr.total_bill, 0) / d.length,
                d => d.day
            )
            .map(d => { return {day: d[0], avg_total_bill: d[1]} });
        console.log(avgPerDay);

        /**
         * To make the pie chart colorfull, a color map is created to map certain days
         * to their corresponding colors.
         */
        var colorMap = new Map([
            ['Thur', 'red'],
            ['Fri', 'blue'],
            ['Sat', 'orange'],
            ['Sun', 'pink']
        ]);

        /**
         * Notice that an arrow function is passed to specify what value the pie chart
         * will use when given an array element `d`.  Recall that `avgPerDay` was 
         * reformatted such that each element is {day: ..., avg_total_bill: ...}, and
         * therefore, the value that will be used to create the pie pieces will be 
         * the `avg_total_bill` field.
         */
        const pieGenerator = d3.pie()
            .value(d => d.avg_total_bill);
        
        /**
         * Here, `avgPerDay` is passed.  `pieGenerator` knows which object field 
         * needs to be made the value for a pie piece.
         */
        const arcData = pieGenerator(avgPerDay);
        console.log(arcData);

        /**
         * `d3.arc()` is a function that creates an arc generation function.  The way
         * it works is it creates arcs given an array of path objects, specifically
         * ones that have a start and end angle.  These path objects are created
         * with `pieGenerator(avgPerDay)`, which is stored in `arcData`.
         */
        const arcGenerator = d3.arc().innerRadius(50).outerRadius(200);

        /**
         * Because we are not dealing with a axis-based plot this time, the plot group
         * will be centered in the middle of the svg.
         */
        const plotGroup = svgContainer.selectAll('#pie-chart-plot-group')
            .data([0])
            .join('g')
            .attr('id', 'pie-chart-plot-group')
            .attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`)


        /**
         * Each pie part is created by binding the arcData and for each element, a 
         * path element is created.  It is unlikely that a particular pie part will
         * be referenced uniquely, so grouping them under a className is sufficient.
         * 
         * The important thing to note here is that the 'd' attribute is set using 
         * arcGenerator, which again accepts a path element containing a start and
         * end angle.  The `pieGenerator` function has generated that for us.
         * 
         * Each element in `arcData` contains a 'data` field, containing the original
         * data that was used to create the path. Therefore, to get the day (or
         * avg_total_bill, but in this case it's not needed), it can be accessed through
         * `d.data`.
         */
        plotGroup.selectAll('.pie-part')
            .data(arcData)
            .join('path')
            .attr('className', 'pie-part')
            .attr('d', d => arcGenerator(d))
            .attr('fill', d => colorMap.get(d.data.day))
            .attr('stroke', 'white');
        
        /**
         * To put labels on each pie part, loop through the data in `arcData` again, this
         * time creating a text element for each element.  Using the `.each` function, 
         * which accepts a function as an argument, we customize the positioning and 
         * text of the label.
         */
        plotGroup.selectAll('.pie-label')
            .data(arcData)
            .join('text')
            .attr('className', 'pie-label')
            .each(function(d) {
                const centroid = arcGenerator.centroid(d);
                /**
                 * It is important to note that a function created with `function` syntax
                 * as opposed to arrow function syntax is necssary here, because we want
                 * to reference the current text element using `this`.
                 */
                d3.select(this)
                    .attr('x', centroid[0])
                    .attr('y', centroid[1])
                    .text(`${d.data.day}`);
            });
    }

    render() {
        return (
            <div>
                <svg id="pie-chart-svg-container" />
            </div>
        );
    }
}

export default PieChart;