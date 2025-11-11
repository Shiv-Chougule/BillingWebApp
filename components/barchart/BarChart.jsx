'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, width = 600, height = 300, margin = { top: 20, right: 30, bottom: 40, left: 40 }, dark = false, isStatusChart = false }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", dark ? "#1f2937" : "#ffffff")
      .style("overflow", "visible");

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height - margin.bottom, margin.top])
      .nice();

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", dark ? "#d1d5db" : "#374151")
      .style("font-size", "12px");

    // Add Y axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("text")
      .style("fill", dark ? "#d1d5db" : "#374151")
      .style("font-size", "12px");

    // Add bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.label))
      .attr("y", d => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - margin.bottom - yScale(d.value))
      .attr("fill", dark ? "#3b82f6" : "#1d4ed8")
      .attr("rx", 3) // Rounded corners
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", dark ? "#60a5fa" : "#3b82f6");

        // Add tooltip
        svg.append("text")
          .attr("class", "tooltip")
          .attr("x", xScale(d.label) + xScale.bandwidth() / 2)
          .attr("y", yScale(d.value) - 10)
          .attr("text-anchor", "middle")
          .attr("fill", dark ? "#ffffff" : "#000000")
          .attr("font-weight", "bold")
          .text(isStatusChart ? d.value.toLocaleString() : `₹${d.value.toLocaleString()}`);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", dark ? "#3b82f6" : "#2563eb");

        // Remove tooltip
        svg.selectAll(".tooltip").remove();
      });

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", dark ? "#374151" : "#e5e7eb")
      .attr("stroke-dasharray", "2,2");

  }, [data, width, height, margin, dark]);

  return (
    <div className={`p-4 rounded-lg ${dark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart;