import * as d3 from 'd3';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { interpolateOranges } from 'd3-scale-chromatic';

const prefix = process.env.NODE_ENV === 'production' ? '/world-map-choropleth' : '';

const margin = { top: 10, left: 10, bottom: 10, right: 10 };
const mapRatio = 0.5;
let width = parseInt(d3.select('#d3').style('width'), 10) - margin.left - margin.right;
let height = width * mapRatio;
const mapRatioAdjuster = 0.35;
const projection = geoKavrayskiy7()
                    .translate([width / 2, height / 2])
                    .scale(width * [mapRatio - mapRatioAdjuster]);


const path = d3.geoPath().projection(projection);

const color = d3.scaleSequential(interpolateOranges);

const dtime = d3.map();

function zoomed() {
  features.selectAll('path').style('stroke-width', `${0.75 / d3.event.transform.k}px`);
  features.attr('transform', d3.event.transform);
}

const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on('zoom', zoomed);

const svg = d3.select('#d3')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .call(zoom);

const features = svg.append('g');

function ready(error, world, dtimeJson) {
  if (error) return console.error(error);

  dtimeJson.forEach((d) => {
    dtime.set(d.country, +d.count_dtime);
  });

  features.selectAll('path')
    .data(topojson.feature(world, world.objects.ne_50m_admin_0_countries).features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', (d) => {
      d.properties.count_dtime = dtime.get(d.properties.iso_a2);
      let result = color(dtime.get(d.properties.iso_a2) / dtimeJson[0].count_dtime);
      if (result === 'rgb(0, 0, 0)') {
        result = 'rgb(255, 255, 255)';
      }
      return result;
    })
    .attr('stroke', '#404040')
    .attr('stroke-width', 0.45)
    .on('mousemove', (d) => {
      d3.select('#tooltip')
        .style('top', `${d3.event.pageY + 20}px`)
        .style('left', `${d3.event.pageX + 20}px`)
        .select('#country')
        .text(d.properties.name);

      d3.select('#tooltip')
        .select('#dtime')
        .text(() => {
          if (d.properties.count_dtime) {
            return d.properties.count_dtime;
          }
          return 'N/A';
        });

      d3.select('#tooltip').classed('hidden', false);
    })

    .on('mouseout', () => {
      d3.select('#tooltip').classed('hidden', true);
    });
}

function resize() {
  width = parseInt(d3.select('#d3').style('width'), 10) - margin.left - margin.right;
  height = width * mapRatio;

  projection.translate([width / 2, height / 2])
            .scale(width * [mapRatio - mapRatioAdjuster]);

  svg.style('width', `${width}px`)
      .style('height', `${height}px`);

  svg.selectAll('path').attr('d', path);
}

d3.select(window).on('resize', resize);

d3.queue()
  .defer(d3.json, `${prefix}/data/worldmap/ne_50m_admin_0_countries-topojson.json`)
  .defer(d3.json, `${prefix}/data/data.json`)
  .await(ready);
