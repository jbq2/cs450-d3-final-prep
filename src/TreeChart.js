import { Component } from "react";
import * as d3 from 'd3';

class TreeChart extends Component {
    constructor(props) {
        super(props);
        this.state = {date: []};
    }

    componentDidMount() {
        /**
         * Notice that `data` is set up in a hierarchical way.  It needs to be
         * like that because of D3's tree functionality.
         */
        const data = {
            "name": "Root",
            "children": [
                {
                    "name": "Branch 1",
                    "children": [
                        {
                            "name": "Leaf 1",
                            "size": 10,
                            "color": "red"
                        },
                        {
                            "name": "Leaf 2",
                            "size": 20,
                            "color": "blue"
                        }
                    ]
                },
                {
                    "name": "Branch 2",
                    "children": [
                        {
                        "name": "Leaf 3",
                            "size": 15,
                            "color": "green"
                        },
                        {
                            "name": "Leaf 4",
                            "size": 25,
                            "color": "purple",
                            "children": [
                                {
                                "name": "Subleaf",
                                "size": 5,
                                "color": "orange"
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        this.setState({data: data})
        console.log('TreeChart component mounted');
    }

    componentDidUpdate() {
        console.log('TreeChart component updated');

        const rawData = this.state.data;
        const svgContainer = d3.select('#tree-chart-svg-container')
            .attr('width', 800)
            .attr('height', 700);
        const plotGroup = svgContainer.selectAll('#tree-chart-plot-group')
            .data([0])
            .join('g')
            .attr('id', 'tree-chart-svg-container')
            .attr('transform', `translate(0, 50)`);
        
        /**
         * Here we set up the tree object with the gven width and height.
         * The return value of `d3.tree()` is a TreeLayout, which is a 
         * function that accepts hierarchical data and creates nodes with
         * specified x and y values.  This is important for positioning.
         */
        const treeWidth = 700;
        const treeHeight = 600;
        const treeLayout = d3.tree().size([treeWidth, treeHeight]);

        /**
         * `d3.hierarchy` accepts a json object of hierarchical structure,
         * creating an object that represents the root node of the tree.
         * 
         * After passing `root` into `treeLayout`, the result is `root`
         * with added information--specifically the x and y positioning of
         * each node.
         */
        const root = d3.hierarchy(rawData);
        treeLayout(root);
        console.log(root.descendants());

        /**
         * An important detail to note here is that `.links()` returns
         * all edges of the tree, where each edge has a `source` and
         * `target` object.  `source` refers to the parent node, and
         * `target` refers to the child node.  `source` and `target`
         * have x and y fields, and with this, we are able to to draw
         * an svg line element.
         */
        plotGroup.selectAll('.edge')
            .data(root.links())
            .join('line')
            .attr('className', 'edge')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', 'black');

        /**
         * toolTip code
         */
        const toolTip = d3.select('body')
            .selectAll('#tool-tip-div')
            .data([0])
            .join('div')
            .attr('id', 'tool-tip-div')
            .style('position', 'absolute')
            .style('visibility', 'hidden');
        
        /**
         * An important detail to note here is that `.descendants()`
         * returns an array of all nodes/vertices in the tree.  Each 
         * node, of course, contains the x and y position, as well as 
         * any original data of the node in the `data` field.  In this
         * tree, we generate a svg circle element for each node
         * in the `.descendents()` array.
         */
        plotGroup.selectAll('.vertex')
            .data(root.descendants())
            .join('circle')
            .attr('className', 'vertex')
            .attr('r', 40)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('fill', 'lime')
            .on('mouseover', (event, d) => {
                console.log(event);
                toolTip.html(d.data.name).style('visibility', 'visible');
            })
            .on('mousemove', (event) => {
                toolTip
                    .style('top', event.pageY - 10 + 'px')
                    .style('left', event.pageX + 10 + 'px');
            })
            .on('mouseout', (event) => {
                console.log(event);
                toolTip.style('visibility', 'hidden');
            });
        
        plotGroup.selectAll('.vertex-label')
            .data(root.descendants())
            .join('text')
            .attr('className', 'vertex')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            /**
             * The `dominant-baseline` and `text-anchor` attributes help
             * ensure that the text is centered on the middle baseline,
             * instead of being to the left of the middle basline.
             */
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('stroke', 'blue')
            .attr('font-size', 12)
            .text(d => d.data.name); 
    }

    render() {
        return (
            <div>
                <svg id="tree-chart-svg-container" />
            </div>
        );
    }
}

export default TreeChart;