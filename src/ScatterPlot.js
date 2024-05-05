import { Component } from "react";
import * as d3 from 'd3';

class ScatterPlot extends Component {
    constructor(props) {
        super(props);
        this.state = {data: []};
    }
    
    componentDidMount() {
        console.log('ScatterPlot component mounted');
    }

    componentDidUpdate() {
        console.log('ScatterPlot component updated');
        const data = this.props.data;
        console.log(data);

        /** 
         * Here we provide the margins that will be used for the plot itself
         */
        const margin = {
            top: 10,
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
        const svgContainer = d3.select('#svg-container')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        /**
         * Below block creates a g element (group), which will encompass the actual 
         * scatter plot points.  Note that for g elements, the way to move them is
         * via the transform attribute, and using the `translate` function.
         * 
         * Since we must take into account making space for the left axis, we must
         * translate the group by `margin.left` pixels on the x axis.
         */
        svgContainer.selectAll('g')
            .data([0])
            .join('g')
            .attr('id', 'plot-group');
        const plotGroup = svgContainer.select('#plot-group')
            .attr('transform', `translate(${margin.left}, 0)`);

        /**
         * Below we create a scaling function for the x axis.  The `domain` represents
         * the data range, while the `range` represents the element width.  Due to this
         * we must set it to the width of the actual svg object.
         */
        const xData = data.map(d => d.total_bill);
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(xData)])         // use domain for actual range of data
            .range([margin.left, svgWidth]);    // use range to set the pixel/screen size of the scale
        
        /**
         * For some reason, the height of the svg is not high enough to show the full 
         * tick labels, so I create a constant here for the  yScaleHeight.
         */
        const yScaleHeight = svgHeight - margin.top - 25;

        /**
         * Same scaling function idea here, but for the y axis.
         */
        const yData = data.map(d => d.tip);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(yData)])
            .range([yScaleHeight, margin.top]);
        
        /**
         * To create an x axis, we must create a g element to hold it.  Once this 
         * element is selected, we move it to the correct place with the transform
         * attribute.  Specifically, we must place it on the very left edge of the 
         * svg container, and translate it so that it is placed at the bottom of
         * the svg container.
         */
        const xAxisGroup = svgContainer.selectAll('#x-axis-g')
            .data([0])
            .join('g')
            .attr('id', 'x-axis-g')
            .attr('transform', `translate(0, ${yScaleHeight})`)
            .call(d3.axisBottom(xScale));
        
        /**
         * To create a y axis, specifically on the left side, we create another
         * g element to hold it.  We select it, and then transform it to appear
         * on the left, slightly offset based on the margin.  We do this so that
         * the tick labels have enough space to appear.  The y setting for
         * for translating is set to 0, as the y-axis grows downward.
         */
        const yAxisGroup = svgContainer.selectAll('#y-axis-g')
            .data([0])
            .join('g')
            .attr('id', 'y-axis-g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        /**
         * Here we actual plot the data.  We bind the data to circle elements
         * (ones that don't actually exist yet), and for each data point that
         * has no associative circle element, we join it with one and set the
         * attributes accordingly.  Note that for the `cx` and `cy` attributes,
         * we scale the data using the x and y axis scaling functions that were
         * created from earlier.
         */
        plotGroup.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('r', d => d.size)
            .attr('cx', d => xScale(d.total_bill))
            .attr('cy', d => yScale(d.tip))
            .attr('fill', 'red');
    }
    
    render() {
        return (
            <div>
                <svg id='svg-container' />
            </div>
        );
    }
}

export default ScatterPlot;