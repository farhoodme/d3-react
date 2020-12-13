import React, {useRef, useState, useEffect} from 'react';
import * as d3 from 'd3';
import './App.css';
import data from './data.json';

const processData = (array) => {
  const years = array.reduce((result, currentValue) => {
    (result).push(
      {
        "token": currentValue.tokens.reduce((token, i) => {
          return i.value
        }, null),
        "year": currentValue.PY,
        "value": currentValue.tokens.reduce((token, i) => {
          return i.id.value
        }, null)
      }
    );
    return result;
  }, []);

  console.log(JSON.stringify(years));
};

function App() {
  const [maxItem, setMaxItem] = useState(50);
  const [selection, setSelection] = useState<null | d3.Selection<
      SVGSVGElement | null,
      unknown,
      null,
      undefined
      >>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const keys = [
    "2009",
    "2010",
    "2011",
    "2012",
    "2013",
    "2014"
  ];
  
  var margin = {top: 20, right: 20, bottom: 60, left: 30},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var tokenNames = data.map(d => d.token);
  var yearNames = data[0].values.map((d) => { return d.year; });

  // The scale the groups:
  var x0 = d3.scaleBand().domain(tokenNames.slice(0, maxItem)).rangeRound([0, width]).paddingInner(0.02);

  // The scale for each bar:
  var x1 = d3.scaleBand().domain(yearNames).rangeRound([0, x0.bandwidth()]).padding(0.05);

  var y = d3.scaleLinear().domain([0, d3.max(data.slice(0, maxItem), token => d3.max(token.values, d => d.value))!]).rangeRound([height, 0]);

  var color = d3.scaleOrdinal<string>().range(["#063f5b", "#767b90", "#314b7a", "#66a277", "#688c9c", "#2ebdcd"]);

  useEffect(() => {   
    if(!selection) {
      setSelection(d3.select(svgRef.current))
    } else {
      var svg = selection
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .selectAll("g")
        .data(data.slice(0, maxItem))
        .enter().append("g")
        .attr("class","barGroup")
        .attr("transform", d => "translate(" + x0(d.token) + ",0)")
        .selectAll("rect")
        .data(d => d.values)
        .enter().append("rect")
        .attr("x", d => x1(d.year)!)
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.year));

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start")

      svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("y", -5)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("count(id)");

      var legend = svg.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
          .selectAll("g")
          .data(keys)
          .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 17 + ")"; });

      legend.append("rect")
        .attr("x", width - 25)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color)
        .attr("stroke", color)
        .attr("stroke-width", 1);

      legend.append("text")
        .attr("x", width - 30)
        .attr("y", 8)
        .attr("dy", "0.32em")
        .text(d => d);
    }
  }, [selection]);

  return (
    <div className="App">
      <svg ref={svgRef} width="960" height="300"></svg>
    </div>
  );
}

export default App;
